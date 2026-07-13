import { PRODUCT_IMAGES_BUCKET } from '../constants/productMeta.js';
import { toSlug } from '../productAutomation.js';
import { isSupabaseConfigured, supabase, supabaseAnonKey, supabaseUrl } from '../../lib/supabase.js';

let ensureBucketPromise = null;

function serializeError(error) {
  if (!error) return null;
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    status: error.status,
  };
}

function logUploadDiag(scope, payload = {}) {
  const entry = {
    ts: new Date().toISOString(),
    scope,
    ...payload,
  };
  console.log('[UPLOAD_DIAG]', entry);
  if (typeof window !== 'undefined') {
    window.__SJ_UPLOAD_DIAG__ = window.__SJ_UPLOAD_DIAG__ || [];
    window.__SJ_UPLOAD_DIAG__.push(entry);
  }
}

function encodePath(path = '') {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function buildStorageObjectUrl(path) {
  const encodedPath = encodePath(path);
  const url = `${supabaseUrl}/storage/v1/object/${PRODUCT_IMAGES_BUCKET}/${encodedPath}`;
  logUploadDiag('buildStorageObjectUrl', { path, bucket: PRODUCT_IMAGES_BUCKET, url });
  return url;
}

function buildStoragePublicUrl(path) {
  const encodedPath = encodePath(path);
  const url = `${supabaseUrl}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${encodedPath}`;
  logUploadDiag('buildStoragePublicUrl', { path, bucket: PRODUCT_IMAGES_BUCKET, url });
  return url;
}

function assertSupabaseStorageReady() {
  if (!isSupabaseConfigured || !supabase || !supabaseAnonKey || !supabaseUrl) {
    throw new Error('Supabase Storage no está configurado en este entorno');
  }
}

async function getAccessToken() {
  assertSupabaseStorageReady();
  const { data, error } = await supabase.auth.getSession();
  logUploadDiag('getAccessToken.session', {
    session: data?.session || null,
    access_token: data?.session?.access_token || null,
    expires_at: data?.session?.expires_at || null,
    userId: data?.session?.user?.id || null,
    error: serializeError(error),
  });
  if (error) {
    throw new Error('No se pudo leer la sesión de Supabase para subir imágenes');
  }

  const token = data?.session?.access_token;
  if (!token) {
    logUploadDiag('getAccessToken.noSession', {
      reason: 'session_null_or_missing_access_token',
      session: data?.session || null,
    });
    throw new Error('Debes iniciar sesión con una cuenta de Supabase para subir imágenes');
  }

  return token;
}

export async function ensureProductsBucket() {
  assertSupabaseStorageReady();

  // El bucket se crea por migraciones/SQL; en frontend solo validamos configuración.
  if (!ensureBucketPromise) {
    ensureBucketPromise = Promise.resolve(true);
  }

  return ensureBucketPromise;
}

export function buildCategoryStorageSlug(category = '') {
  return toSlug(category || 'general') || 'general';
}

export function buildProductStorageSlug(nameOrSlug = '') {
  return toSlug(nameOrSlug || 'producto') || 'producto';
}

export function buildDraftImagePath(draftId = '', imageId = '') {
  const safeDraftId = toSlug(draftId) || 'draft';
  const safeImageId = toSlug(imageId) || String(Date.now());
  return `drafts/${safeDraftId}/${safeImageId}.webp`;
}

export function buildFinalImagePath(category = '', productSlug = '', index = 1) {
  const categorySlug = buildCategoryStorageSlug(category);
  const safeProductSlug = buildProductStorageSlug(productSlug);
  const sequence = String(index).padStart(2, '0');
  return `${categorySlug}/${safeProductSlug}/${safeProductSlug}-${sequence}.webp`;
}

export async function uploadDraftImage({ blob, draftId, imageId, onProgress }) {
  assertSupabaseStorageReady();
  await ensureProductsBucket();

  const path = buildDraftImagePath(draftId, imageId);
  logUploadDiag('uploadDraftImage.request', {
    bucket: PRODUCT_IMAGES_BUCKET,
    path,
    method: 'SUPABASE_STORAGE_UPLOAD',
    body: {
      type: blob?.type || '',
      size: blob?.size || 0,
      isBlob: blob instanceof Blob,
    },
  });

  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, blob, {
    upsert: true,
    contentType: 'image/webp',
    cacheControl: '31536000',
  });

  if (error) {
    logUploadDiag('uploadDraftImage.upload.error', {
      bucket: PRODUCT_IMAGES_BUCKET,
      path,
      error: serializeError(error),
    });
    throw error;
  }

  onProgress?.(blob?.size || 0, blob?.size || 0);

  return {
    path,
    url: buildStoragePublicUrl(path),
  };
}

export async function removeProductImagePaths(paths = []) {
  if (!supabase || !paths.length) return;
  const cleanPaths = paths.filter(Boolean);
  if (!cleanPaths.length) return;
  logUploadDiag('removeProductImagePaths', {
    bucket: PRODUCT_IMAGES_BUCKET,
    paths: cleanPaths,
  });
  await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(cleanPaths);
}

export function getPathFromPublicUrl(url = '') {
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return '';
  return decodeURIComponent(url.slice(markerIndex + marker.length));
}

export async function finalizeDraftImages({ items, category, productSlug }) {
  assertSupabaseStorageReady();
  await ensureProductsBucket();

  const normalizedProductSlug = buildProductStorageSlug(productSlug);
  const draftPathsToRemove = [];

  const finalizedItems = await Promise.all(
    items.map(async (item, index) => {
      if (!item?.url && !item?.draftPath) {
        return item;
      }

      if (!item.draftPath) {
        return {
          ...item,
          path: item.path || getPathFromPublicUrl(item.url || ''),
        };
      }

      const finalPath = buildFinalImagePath(category, normalizedProductSlug, index + 1);
      logUploadDiag('finalizeDraftImages.download', {
        bucket: PRODUCT_IMAGES_BUCKET,
        fromPath: item.draftPath,
      });
      const { data: downloaded, error: downloadError } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).download(item.draftPath);
      if (downloadError || !downloaded) {
        throw downloadError || new Error('No se pudo preparar la imagen para finalizar');
      }

      logUploadDiag('finalizeDraftImages.upload', {
        bucket: PRODUCT_IMAGES_BUCKET,
        toPath: finalPath,
        contentType: 'image/webp',
        size: downloaded?.size || 0,
      });
      const { error: uploadError } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(finalPath, downloaded, {
        upsert: true,
        contentType: 'image/webp',
        cacheControl: '31536000',
      });

      if (uploadError) throw uploadError;

      draftPathsToRemove.push(item.draftPath);

      return {
        ...item,
        path: finalPath,
        draftPath: '',
        url: buildStoragePublicUrl(finalPath),
      };
    }),
  );

  if (draftPathsToRemove.length) {
    logUploadDiag('finalizeDraftImages.removeDrafts', {
      bucket: PRODUCT_IMAGES_BUCKET,
      paths: draftPathsToRemove,
    });
    await removeProductImagePaths(draftPathsToRemove);
  }

  return finalizedItems;
}

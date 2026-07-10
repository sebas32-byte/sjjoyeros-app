import { PRODUCT_IMAGES_BUCKET } from '../constants/productMeta.js';
import { toSlug } from '../productAutomation.js';
import { isSupabaseConfigured, supabase, supabaseAnonKey, supabaseUrl } from '../../lib/supabase.js';

let ensureBucketPromise = null;

function encodePath(path = '') {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function buildStorageObjectUrl(path) {
  const encodedPath = encodePath(path);
  return `${supabaseUrl}/storage/v1/object/${PRODUCT_IMAGES_BUCKET}/${encodedPath}`;
}

function buildStoragePublicUrl(path) {
  const encodedPath = encodePath(path);
  return `${supabaseUrl}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${encodedPath}`;
}

function assertSupabaseStorageReady() {
  if (!isSupabaseConfigured || !supabase || !supabaseAnonKey || !supabaseUrl) {
    throw new Error('Supabase Storage no está configurado en este entorno');
  }
}

export async function ensureProductsBucket() {
  assertSupabaseStorageReady();

  if (ensureBucketPromise) return ensureBucketPromise;

  ensureBucketPromise = (async () => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const exists = Array.isArray(buckets) && buckets.some((bucket) => bucket.name === PRODUCT_IMAGES_BUCKET);
      if (exists) return;

      const { error } = await supabase.storage.createBucket(PRODUCT_IMAGES_BUCKET, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: ['image/webp', 'image/jpeg', 'image/png'],
      });

      if (error && !String(error.message || '').toLowerCase().includes('already exists')) {
        throw error;
      }
    } catch (error) {
      const message = String(error?.message || '').toLowerCase();
      const isPermissionError = message.includes('not authorized') || message.includes('permission') || message.includes('jwt');
      if (!isPermissionError) throw error;
    }
  })();

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

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', buildStorageObjectUrl(path));
    xhr.setRequestHeader('apikey', supabaseAnonKey);
    xhr.setRequestHeader('Authorization', `Bearer ${supabaseAnonKey}`);
    xhr.setRequestHeader('x-upsert', 'true');
    xhr.setRequestHeader('cache-control', '31536000');
    xhr.setRequestHeader('content-type', 'image/webp');

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(event.loaded, event.total);
    };

    xhr.onerror = () => reject(new Error('No se pudo subir la imagen al almacenamiento'));

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(null);
        return;
      }
      reject(new Error(`Error al subir imagen (${xhr.status})`));
    };

    xhr.send(blob);
  });

  return {
    path,
    url: buildStoragePublicUrl(path),
  };
}

export async function removeProductImagePaths(paths = []) {
  if (!supabase || !paths.length) return;
  const cleanPaths = paths.filter(Boolean);
  if (!cleanPaths.length) return;
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
      const { data: downloaded, error: downloadError } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).download(item.draftPath);
      if (downloadError || !downloaded) {
        throw downloadError || new Error('No se pudo preparar la imagen para finalizar');
      }

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
    await removeProductImagePaths(draftPathsToRemove);
  }

  return finalizedItems;
}

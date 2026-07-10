import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { optimizeImageFile } from '../utils/imageProcessor.js';
import { finalizeDraftImages, removeProductImagePaths, uploadDraftImage } from '../services/productStorage.js';

function createDraftId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createImageId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeIncomingUrls(urls = []) {
  return (Array.isArray(urls) ? urls : [])
    .filter(Boolean)
    .map((url, index) => ({
      id: `existing-${index}-${String(url)}`,
      url,
      previewUrl: url,
      status: 'linked',
      progress: 100,
      isPrimary: index === 0,
      draftPath: '',
      path: '',
      error: '',
      originalFile: null,
      optimizedBytes: 0,
      originalBytes: 0,
    }));
}

function withPrimaryFirst(items = []) {
  if (!items.length) return items;
  const hasPrimary = items.some((item) => item.isPrimary);
  if (hasPrimary) return items;
  return items.map((item, index) => ({ ...item, isPrimary: index === 0 }));
}

export function useProductImagesUpload() {
  const [items, setItems] = useState([]);
  const [draftId, setDraftId] = useState(createDraftId());
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const updateItem = useCallback((id, updater) => {
    setItems((current) => current.map((item) => {
      if (item.id !== id) return item;
      const next = typeof updater === 'function' ? updater(item) : { ...item, ...updater };
      return next;
    }));
  }, []);

  const processAndUpload = useCallback(async (item) => {
    try {
      updateItem(item.id, { status: 'optimizing', progress: 5, error: '' });

      const optimized = await optimizeImageFile(item.originalFile, {
        maxWidth: 1600,
        quality: 0.82,
        onProgress: (progress) => {
          updateItem(item.id, { status: 'optimizing', progress: Math.min(35, Math.max(5, Math.round(progress * 0.35))) });
        },
      });

      updateItem(item.id, { status: 'uploading', progress: 40 });
      const uploaded = await uploadDraftImage({
        blob: optimized.blob,
        draftId,
        imageId: item.id,
        onProgress: (loaded, total) => {
          if (!total) return;
          const uploadProgress = Math.round((loaded / total) * 60);
          updateItem(item.id, { status: 'uploading', progress: Math.min(99, 40 + uploadProgress) });
        },
      });

      updateItem(item.id, {
        status: 'uploaded',
        progress: 100,
        error: '',
        draftPath: uploaded.path,
        url: uploaded.url,
        optimizedBytes: optimized.optimizedSize,
        originalBytes: optimized.originalSize,
      });
    } catch (error) {
      updateItem(item.id, {
        status: 'error',
        progress: 0,
        error: error?.message || 'No se pudo procesar la imagen',
      });
    }
  }, [draftId, updateItem]);

  const addFiles = useCallback((fileList) => {
    const files = Array.from(fileList || []).filter((file) => String(file.type || '').startsWith('image/'));
    if (!files.length) return;

    const newItems = files.map((file, index) => ({
      id: createImageId(),
      fileName: file.name || `imagen-${index + 1}`,
      previewUrl: URL.createObjectURL(file),
      url: '',
      status: 'queued',
      progress: 0,
      isPrimary: false,
      draftPath: '',
      path: '',
      error: '',
      originalFile: file,
      optimizedBytes: 0,
      originalBytes: file.size || 0,
    }));

    setItems((current) => withPrimaryFirst([...current, ...newItems]));
    newItems.forEach((item) => {
      void processAndUpload(item);
    });
  }, [processAndUpload]);

  const retryImage = useCallback((id) => {
    const target = itemsRef.current.find((item) => item.id === id);
    if (!target?.originalFile) return;
    void processAndUpload(target);
  }, [processAndUpload]);

  const setPrimaryImage = useCallback((id) => {
    setItems((current) => {
      const targetIndex = current.findIndex((item) => item.id === id);
      if (targetIndex === -1) return current;
      const cloned = [...current];
      const [target] = cloned.splice(targetIndex, 1);
      const reordered = [target, ...cloned];
      return reordered.map((item, index) => ({ ...item, isPrimary: index === 0 }));
    });
  }, []);

  const moveImage = useCallback((sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId) return;

    setItems((current) => {
      const sourceIndex = current.findIndex((item) => item.id === sourceId);
      const targetIndex = current.findIndex((item) => item.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return current;

      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next.map((item, index) => ({ ...item, isPrimary: index === 0 }));
    });
  }, []);

  const removeImage = useCallback(async (id) => {
    const target = itemsRef.current.find((item) => item.id === id);
    if (!target) return;

    if (target.previewUrl && target.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(target.previewUrl);
    }

    if (target.draftPath) {
      await removeProductImagePaths([target.draftPath]);
    }

    setItems((current) => withPrimaryFirst(current.filter((item) => item.id !== id).map((item, index) => ({ ...item, isPrimary: index === 0 }))));
  }, []);

  const resetWithUrls = useCallback((urls = []) => {
    setItems(normalizeIncomingUrls(urls));
    setDraftId(createDraftId());
  }, []);

  const clearAll = useCallback(async () => {
    const currentItems = itemsRef.current;
    const draftPaths = currentItems.map((item) => item.draftPath).filter(Boolean);

    currentItems.forEach((item) => {
      if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });

    if (draftPaths.length) {
      await removeProductImagePaths(draftPaths);
    }

    setItems([]);
    setDraftId(createDraftId());
  }, []);

  const finalizeForProduct = useCallback(async ({ category, productSlug }) => {
    const currentItems = itemsRef.current;
    const hasPending = currentItems.some((item) => item.status === 'queued' || item.status === 'optimizing' || item.status === 'uploading');
    if (hasPending) {
      throw new Error('Espera a que finalice la subida de imágenes');
    }

    const hasErrors = currentItems.some((item) => item.status === 'error');
    if (hasErrors) {
      throw new Error('Corrige las imágenes con error antes de guardar');
    }

    const hasDraftImages = currentItems.some((item) => item.draftPath);
    if (!hasDraftImages) {
      const linkedOnly = currentItems.map((item, index) => ({
        ...item,
        status: 'linked',
        progress: 100,
        isPrimary: index === 0,
      }));

      setItems(linkedOnly);

      return {
        images: linkedOnly.map((item) => item.url).filter(Boolean),
        image: linkedOnly[0]?.url || '',
        imagePaths: linkedOnly.map((item) => item.path).filter(Boolean),
      };
    }

    const finalizedItems = await finalizeDraftImages({
      items: currentItems,
      category,
      productSlug,
    });

    const normalized = finalizedItems.map((item, index) => ({
      ...item,
      status: 'linked',
      progress: 100,
      draftPath: '',
      isPrimary: index === 0,
    }));

    setItems(normalized);

    return {
      images: normalized.map((item) => item.url).filter(Boolean),
      image: normalized[0]?.url || '',
      imagePaths: normalized.map((item) => item.path).filter(Boolean),
    };
  }, []);

  const hasPendingUploads = useMemo(
    () => items.some((item) => item.status === 'queued' || item.status === 'optimizing' || item.status === 'uploading'),
    [items],
  );

  const hasUploadErrors = useMemo(() => items.some((item) => item.status === 'error'), [items]);

  useEffect(() => () => {
    itemsRef.current.forEach((item) => {
      if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
  }, []);

  return {
    images: items,
    addFiles,
    retryImage,
    setPrimaryImage,
    moveImage,
    removeImage,
    resetWithUrls,
    clearAll,
    finalizeForProduct,
    hasPendingUploads,
    hasUploadErrors,
  };
}

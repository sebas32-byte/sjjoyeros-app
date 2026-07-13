function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo leer la imagen'));
    };

    image.src = objectUrl;
  });
}

async function decodeImage(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // Fallback para navegadores sin soporte completo de orientación EXIF.
    }
  }

  return loadImageElement(file);
}

function canvasToWebpBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('No se pudo optimizar la imagen'));
          return;
        }
        resolve(blob);
      },
      'image/webp',
      quality,
    );
  });
}

export async function optimizeImageFile(file, options = {}) {
  const {
    maxWidth = 1600,
    quality = 0.82,
    onProgress,
  } = options;

  onProgress?.(10);
  const decodedImage = await decodeImage(file);

  const sourceWidth = decodedImage.width || decodedImage.naturalWidth || 0;
  const sourceHeight = decodedImage.height || decodedImage.naturalHeight || 0;

  if (!sourceWidth || !sourceHeight) {
    throw new Error('Dimensiones de imagen inválidas');
  }

  const ratio = Math.min(1, maxWidth / sourceWidth);
  const targetWidth = Math.max(1, Math.round(sourceWidth * ratio));
  const targetHeight = Math.max(1, Math.round(sourceHeight * ratio));

  onProgress?.(45);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    throw new Error('No se pudo preparar el optimizador de imágenes');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(decodedImage, 0, 0, targetWidth, targetHeight);

  if (typeof decodedImage.close === 'function') {
    decodedImage.close();
  }

  onProgress?.(80);
  const blob = await canvasToWebpBlob(canvas, quality);
  onProgress?.(100);

  const diag = {
    original: {
      name: file?.name || '',
      type: file?.type || '',
      size: file?.size || 0,
    },
    blob: {
      type: blob?.type || '',
      size: blob?.size || 0,
      isBlob: blob instanceof Blob,
    },
    dimensions: {
      width: targetWidth,
      height: targetHeight,
    },
  };
  console.log('[UPLOAD_DIAG] optimizeImageFile.result', diag);
  if (typeof window !== 'undefined') {
    window.__SJ_UPLOAD_DIAG__ = window.__SJ_UPLOAD_DIAG__ || [];
    window.__SJ_UPLOAD_DIAG__.push({
      ts: new Date().toISOString(),
      scope: 'optimizeImageFile.result',
      ...diag,
    });
  }

  return {
    blob,
    width: targetWidth,
    height: targetHeight,
    originalSize: file.size || 0,
    optimizedSize: blob.size || 0,
  };
}

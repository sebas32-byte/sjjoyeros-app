import React, { useRef, useState } from 'react';

const STATUS_LABELS = {
  queued: 'En cola',
  optimizing: 'Optimizando',
  uploading: 'Subiendo',
  uploaded: 'Subida temporal lista',
  linked: 'Vinculada al producto',
  error: 'Error',
};

export default function ProductImagesUploader({
  images,
  onAddFiles,
  onRemove,
  onSetPrimary,
  onMove,
  onRetry,
}) {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingId, setDraggingId] = useState('');

  function openPicker() {
    inputRef.current?.click();
  }

  function handleFiles(files) {
    if (!files?.length) return;
    onAddFiles(files);
  }

  function onDropFiles(event) {
    event.preventDefault();
    setIsDragOver(false);
    handleFiles(event.dataTransfer?.files);
  }

  return (
    <div className="space-y-3">
      <div
        className={`rounded-[1.5rem] border border-dashed px-4 py-5 text-sm ${isDragOver ? 'border-gold bg-gold/10' : 'border-white/15 bg-black/30'}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDropFiles}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = '';
          }}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-white/90">Arrastra imágenes aquí o selecciónalas desde tu equipo.</p>
            <p className="text-xs text-white/55">Se optimizan en automático (WebP, ancho máximo 1600px) y se suben en segundo plano.</p>
          </div>
          <button type="button" onClick={openPicker} className="rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/80">
            Seleccionar imágenes
          </button>
        </div>
      </div>

      {images.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => setDraggingId(image.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                onMove(draggingId, image.id);
                setDraggingId('');
              }}
              className="space-y-2 rounded-[1.25rem] border border-white/10 bg-black/35 p-3"
            >
              <div className="aspect-square overflow-hidden rounded-xl bg-black/20">
                <img
                  src={image.previewUrl || image.url}
                  alt={image.fileName || 'Imagen del producto'}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="space-y-1">
                <p className="truncate text-xs text-white/70">{image.fileName || image.url}</p>
                <p className={`text-xs ${image.status === 'error' ? 'text-red-300' : 'text-white/60'}`}>
                  {STATUS_LABELS[image.status] || image.status}
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full transition-all ${image.status === 'error' ? 'bg-red-400' : 'bg-gold'}`} style={{ width: `${image.progress || 0}%` }} />
                </div>
                {image.error ? <p className="text-xs text-red-300">{image.error}</p> : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => onSetPrimary(image.id)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs">
                  {image.isPrimary ? 'Principal' : 'Elegir principal'}
                </button>
                {image.status === 'error' ? (
                  <button type="button" onClick={() => onRetry(image.id)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs">
                    Reintentar
                  </button>
                ) : null}
                <button type="button" onClick={() => onRemove(image.id)} className="rounded-full border border-red-400/40 px-3 py-1.5 text-xs text-red-300">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

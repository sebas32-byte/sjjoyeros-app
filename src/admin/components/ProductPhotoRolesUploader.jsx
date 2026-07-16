import React, { useMemo, useRef, useState } from 'react';

const PHOTO_SLOTS = [
  {
    key: 'hero',
    title: 'Hero Shot',
    hint: 'Esta sera la fotografia principal del catalogo y del detalle.',
    required: true,
  },
  {
    key: 'side',
    title: 'Vista lateral',
    hint: 'Mostrar grosor y profundidad.',
    required: false,
  },
  {
    key: 'back',
    title: 'Vista trasera',
    hint: 'Mostrar cierre y acabado.',
    required: false,
  },
  {
    key: 'detail',
    title: 'Detalle / Macro',
    hint: 'Mostrar textura o grabados.',
    required: false,
  },
  {
    key: 'lifestyle',
    title: 'Lifestyle',
    hint: 'Producto en uso.',
    required: false,
  },
];

function slotImage(items, index) {
  if (!Array.isArray(items)) return null;
  const explicit = items.find((item) => item?.slotIndex === index);
  return explicit || null;
}

export default function ProductPhotoRolesUploader({
  images,
  onSetSlotFile,
  onRemoveSlot,
  hasPendingUploads,
  hasUploadErrors,
}) {
  const inputRefs = useRef({});
  const [lightbox, setLightbox] = useState(null);

  const loadedCount = useMemo(
    () => PHOTO_SLOTS.reduce((acc, _, index) => (slotImage(images, index)?.url || slotImage(images, index)?.previewUrl ? acc + 1 : acc), 0),
    [images],
  );

  const heroMissing = !slotImage(images, 0)?.url && !slotImage(images, 0)?.previewUrl;
  const missingRecommended = PHOTO_SLOTS
    .map((slot, index) => ({ slot, image: slotImage(images, index) }))
    .filter(({ slot, image }) => !slot.required && !(image?.url || image?.previewUrl))
    .map(({ slot }) => slot.title);

  async function handleSlotFile(index, fileList) {
    const file = Array.from(fileList || []).find((item) => String(item?.type || '').startsWith('image/'));
    if (!file) return;
    await onSetSlotFile?.(file, index);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gold/20 bg-black/25 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-display text-2xl leading-[0.95] text-white">Progreso de fotografias</p>
          <p className="text-xs uppercase tracking-[0.2em] text-gold/80">{loadedCount} de {PHOTO_SLOTS.length} fotografias cargadas</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-[linear-gradient(90deg,#b8962e,#d4af37,#e8c84a)] transition-all duration-500"
            style={{ width: `${Math.round((loadedCount / PHOTO_SLOTS.length) * 100)}%` }}
          />
        </div>

        <div className="mt-3 space-y-1.5 text-xs">
          {heroMissing ? <p className="text-amber-300">Hero Shot es obligatoria para publicar.</p> : <p className="text-emerald-300">Hero Shot lista.</p>}
          {missingRecommended.length ? (
            <p className="text-white/60">Faltan recomendadas: {missingRecommended.join(', ')}.</p>
          ) : (
            <p className="text-white/60">Todas las vistas recomendadas estan completas.</p>
          )}
          {hasPendingUploads ? <p className="text-white/55">Subiendo en segundo plano...</p> : null}
          {hasUploadErrors ? <p className="text-red-300">Hay fotografias con error. Reemplaza o elimina para continuar.</p> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PHOTO_SLOTS.map((slot, index) => {
          const image = slotImage(images, index);
          const src = image?.previewUrl || image?.url || '';
          const isReady = Boolean(image?.url || image?.previewUrl);

          return (
            <article key={slot.key} className="group rounded-[1.4rem] border border-white/10 bg-black/30 p-3.5 transition hover:border-gold/35 hover:shadow-[0_16px_44px_rgba(0,0,0,0.34)]">
              <input
                ref={(element) => {
                  inputRefs.current[slot.key] = element;
                }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  void handleSlotFile(index, event.target.files);
                  event.target.value = '';
                }}
              />

              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-2xl leading-[0.95] text-white">{slot.title}</h3>
                  <p className="mt-1 text-xs text-white/55">{slot.hint}</p>
                </div>
                {slot.required ? <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-gold">Obligatoria</span> : null}
              </div>

              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-[#111111]">
                {isReady ? (
                  <img
                    src={src}
                    alt={`${slot.title} - ${image?.fileName || 'imagen'}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-3 text-center text-xs text-white/35">Sin fotografia asignada</div>
                )}
              </div>

              <div className="mt-3 space-y-2">
                <p className="text-xs text-white/55">{image?.status === 'error' ? image?.error || 'Error de carga' : image?.status === 'uploading' ? 'Subiendo...' : image?.status === 'optimizing' ? 'Optimizando...' : image?.status === 'uploaded' || image?.status === 'linked' ? 'Lista' : isReady ? 'Lista' : 'Pendiente'}</p>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full transition-all ${image?.status === 'error' ? 'bg-red-400' : 'bg-gold'}`} style={{ width: `${image?.progress || (isReady ? 100 : 0)}%` }} />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => inputRefs.current[slot.key]?.click()}
                  className="luxury-btn-secondary px-3 py-1.5 text-xs"
                >
                  {isReady ? 'Reemplazar' : 'Cargar'}
                </button>
                <button
                  type="button"
                  disabled={!isReady}
                  onClick={() => setLightbox({ src, title: slot.title })}
                  className="luxury-btn-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Ver grande
                </button>
                <button
                  type="button"
                  disabled={!isReady}
                  onClick={() => onRemoveSlot?.(index)}
                  className="luxury-btn-danger px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Eliminar
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {lightbox?.src ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4" onClick={() => setLightbox(null)}>
          <button type="button" className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-white/80">Cerrar</button>
          <img src={lightbox.src} alt={lightbox.title || 'Vista de fotografia'} className="max-h-[90vh] max-w-[92vw] rounded-2xl object-contain" />
        </div>
      ) : null}
    </div>
  );
}

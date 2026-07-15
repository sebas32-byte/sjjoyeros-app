import React, { useMemo, useState } from 'react';

function formatCurrency(value) {
  return value ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value) : 'Precio disponible';
}

function normalizeGallery(product) {
  const images = Array.isArray(product?.images) ? product.images.filter(Boolean) : [];
  const fallback = product?.image ? [product.image] : [];
  return Array.from(new Set([...images, ...fallback].filter(Boolean)));
}

function getStockLabel(product) {
  const inventory = String(product?.inventory_status || '').toLowerCase();
  if (inventory.includes('agotado')) return 'Agotado';
  if (inventory.includes('pr')) return 'Proximamente';
  return Number(product?.stock || 0) > 0 ? 'Disponible' : 'Agotado';
}

function getStockClass(status) {
  if (status === 'Disponible') return 'text-emerald-300 border-emerald-300/30 bg-emerald-300/10';
  if (status === 'Proximamente') return 'text-amber-300 border-amber-300/30 bg-amber-300/10';
  return 'text-red-300 border-red-300/30 bg-red-300/10';
}

const BENEFITS = [
  'Garantia de calidad SJ Joyeros',
  'Empaque premium listo para regalar',
  'Envio seguro a todo el pais',
];

export default function ProductDetailView({
  product,
  relatedProducts = [],
  onAddToCart,
  onOpenProduct,
  whatsappUrl = '#',
  mode = 'store',
  className = '',
}) {
  const galleryImages = useMemo(() => normalizeGallery(product), [product]);
  const [activeImage, setActiveImage] = useState(() => galleryImages[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  React.useEffect(() => {
    setActiveImage(galleryImages[0] || null);
  }, [galleryImages]);

  if (!product) return null;

  const stockLabel = getStockLabel(product);
  const rating = Number(product?.rating || 4.9);
  const reviews = Number(product?.reviews_count || 127);
  const isPreview = mode === 'preview';

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="text-xs uppercase tracking-[0.22em] text-white/45" aria-label="Breadcrumb">
          <span>Inicio</span>
          <span className="mx-2 text-gold/70">/</span>
          <span>{product.category || product.family || 'Catalogo'}</span>
          <span className="mx-2 text-gold/70">/</span>
          <span className="text-white/70">{product.name}</span>
        </nav>
        {isPreview ? (
          <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gold">Vista previa</span>
        ) : null}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-4">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#101010]">
            <button
              type="button"
              onClick={() => setShowFullscreen(true)}
              className="absolute right-3 top-3 z-20 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-white/80 backdrop-blur"
            >
              Fullscreen
            </button>
            <div className="relative aspect-[4/3] overflow-hidden">
              {activeImage ? (
                <img
                  key={activeImage}
                  src={activeImage}
                  alt={product.name}
                  onClick={() => setIsZoomed((current) => !current)}
                  className={`h-full w-full object-cover transition-all duration-500 ${isZoomed ? 'scale-[1.22] cursor-zoom-out' : 'scale-100 cursor-zoom-in'}`}
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/35">Imagen no disponible</div>
              )}
            </div>
          </div>

          {galleryImages.length > 1 ? (
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => {
                    setActiveImage(image);
                    setIsZoomed(false);
                  }}
                  className={`group relative aspect-square overflow-hidden rounded-2xl border transition-all duration-300 ${activeImage === image ? 'border-gold shadow-[0_0_0_2px_rgba(212,175,55,0.25)]' : 'border-white/12 hover:border-gold/40'}`}
                >
                  <img src={image} alt={`${product.name} miniatura ${index + 1}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 sm:p-7">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-gold/90">{product.family || product.category || 'SJ Joyeros'}</p>
            <h1 className="font-display text-4xl leading-[0.95] sm:text-5xl">{product.name}</h1>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-gold">
                <span>★</span>
                <span className="font-semibold">{rating.toFixed(1)}</span>
                <span className="text-white/55">({reviews})</span>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStockClass(stockLabel)}`}>{stockLabel}</span>
            </div>

            <p className="text-3xl font-semibold text-gold sm:text-4xl">{formatCurrency(product.price)}</p>

            <ul className="space-y-2 text-sm text-white/75">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/50">Cantidad</p>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="h-8 w-8 rounded-full border border-white/10 text-white/80"
                >
                  -
                </button>
                <span className="min-w-8 text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.min(99, current + 1))}
                  className="h-8 w-8 rounded-full border border-white/10 text-white/80"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onAddToCart?.(product, quantity)}
                disabled={isPreview}
                className="rounded-full bg-[linear-gradient(135deg,#e8c84a,#d4af37,#b8962e)] px-5 py-3.5 text-sm font-semibold text-[#0a0a0a] shadow-[0_10px_30px_rgba(212,175,55,0.25)] transition hover:brightness-105 disabled:cursor-default disabled:opacity-70"
              >
                Agregar al carrito
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-gold/35 bg-black/35 px-5 py-3.5 text-sm font-semibold text-gold transition hover:bg-black/55"
              >
                Comprar por WhatsApp
              </a>
            </div>

            <div className="grid gap-2 rounded-2xl border border-white/10 bg-black/25 p-4 text-xs text-white/60 sm:grid-cols-3">
              <p>Pago seguro</p>
              <p>Envio nacional</p>
              <p>Atencion personalizada</p>
            </div>
          </div>
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-3xl">Descripcion</h2>
        <p className="max-w-4xl text-sm leading-7 text-white/72">{product.description || 'Descripcion del producto no disponible.'}</p>
      </section>

      {relatedProducts.length ? (
        <section className="space-y-4">
          <h2 className="font-display text-3xl">Productos relacionados</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpenProduct?.(item)}
                className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-1 hover:border-gold/35"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#121212]">
                  {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /> : <div className="flex h-full items-center justify-center text-white/35">Sin imagen</div>}
                </div>
                <div className="mt-3 space-y-1.5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">{item.subcategory || item.family || 'Producto'}</p>
                  <p className="line-clamp-2 text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-sm text-gold">{formatCurrency(item.price)}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {showFullscreen && activeImage ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4" onClick={() => setShowFullscreen(false)}>
          <button type="button" onClick={() => setShowFullscreen(false)} className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-white/80">Cerrar</button>
          <img src={activeImage} alt={product.name} className="max-h-[90vh] max-w-[92vw] rounded-2xl object-contain" />
        </div>
      ) : null}
    </div>
  );
}

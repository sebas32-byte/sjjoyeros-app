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
  { title: 'Oro Laminado', subtitle: 'de alta calidad', icon: 'diamond' },
  { title: 'No se pela', subtitle: '', icon: 'sparkles' },
  { title: 'Hipoalergenico', subtitle: '', icon: 'flower' },
];

const FOOTER_FEATURES = [
  { icon: 'truck', text: 'Envios a todo Colombia' },
  { icon: 'lock', text: 'Pago seguro' },
  { icon: 'shield', text: 'Garantia de calidad' },
  { icon: 'refresh', text: 'Cambio facil' },
];

function Icon({ name, className = 'h-4 w-4' }) {
  if (name === 'diamond') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M3 9.5 7.5 4h9L21 9.5 12 20 3 9.5Z" />
        <path d="M7.5 4 12 20 16.5 4" />
      </svg>
    );
  }

  if (name === 'sparkles') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 3 13.6 7.4 18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
        <path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" />
      </svg>
    );
  }

  if (name === 'flower') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="12" r="2.2" />
        <path d="M12 4.5c1.7 0 3 1.3 3 3S13.7 10.5 12 10.5 9 9.2 9 7.5s1.3-3 3-3Z" />
        <path d="M19.5 12c0 1.7-1.3 3-3 3s-3-1.3-3-3 1.3-3 3-3 3 1.3 3 3Z" />
        <path d="M12 19.5c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3Z" />
        <path d="M4.5 12c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3-3-1.3-3-3Z" />
      </svg>
    );
  }

  if (name === 'bag') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M6 9h12l-1 11H7L6 9Z" />
        <path d="M9 9V7a3 3 0 0 1 6 0v2" />
      </svg>
    );
  }

  if (name === 'truck') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M3 7h11v9H3z" />
        <path d="M14 10h3l3 3v3h-6z" />
        <circle cx="7" cy="18" r="1.6" />
        <circle cx="17" cy="18" r="1.6" />
      </svg>
    );
  }

  if (name === 'lock') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 1 1 8 0v3" />
      </svg>
    );
  }

  if (name === 'shield') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="m12 3 7 3v6c0 4.7-2.9 7.6-7 9-4.1-1.4-7-4.3-7-9V6l7-3Z" />
      </svg>
    );
  }

  if (name === 'refresh') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M20 7v5h-5" />
        <path d="M4 17v-5h5" />
        <path d="M6.6 10A7 7 0 0 1 18 8" />
        <path d="M17.4 14A7 7 0 0 1 6 16" />
      </svg>
    );
  }

  return null;
}

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
  const rating = Number(product?.rating || 5);
  const reviews = Number(product?.reviews_count || 12);
  const isPreview = mode === 'preview';
  const thumbnails = galleryImages.slice(0, 4);

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="luxury-breadcrumb" aria-label="Breadcrumb">
          <span>Inicio</span>
          <span className="luxury-breadcrumb-sep">/</span>
          <span>{product.material || product.family || 'Oro Laminado'}</span>
          <span className="luxury-breadcrumb-sep">/</span>
          <span className="text-gold-light">{product.category || 'Aretes'}</span>
        </nav>
        {isPreview ? (
          <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gold">Vista previa</span>
        ) : null}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.16fr_0.84fr]">
        <section className="space-y-6">
          <div className="product-gallery-shell">
            <button
              type="button"
              onClick={() => setShowFullscreen(true)}
              className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/65 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white/88 backdrop-blur transition duration-300 ease-out hover:-translate-y-0.5 hover:border-gold/35 hover:bg-black/80"
            >
              <Icon name="sparkles" className="h-3.5 w-3.5" />
              Fullscreen
            </button>
            <span className="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-gold/45 bg-black/70 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-gold-light shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
              <Icon name="diamond" className="h-3.5 w-3.5" />
              Oro Laminado
            </span>
            <div className="product-hero-stage">
              {activeImage ? (
                <img
                  key={activeImage}
                  src={activeImage}
                  alt={product.name}
                  onClick={() => setIsZoomed((current) => !current)}
                  className={`product-hero-image ${isZoomed ? 'scale-[1.18] cursor-zoom-out' : 'scale-100 cursor-zoom-in'}`}
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[#4a433a]">Imagen no disponible</div>
              )}
            </div>
          </div>

          {thumbnails.length > 1 ? (
            <div className="grid grid-cols-4 gap-3">
              {thumbnails.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => {
                    setActiveImage(image);
                    setIsZoomed(false);
                  }}
                  className={`product-thumb-card group relative aspect-square overflow-hidden ${activeImage === image ? 'is-active' : ''}`}
                >
                  <img src={image} alt={`${product.name} miniatura ${index + 1}`} className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.04]" loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section className="luxury-panel p-6 xl:p-7">
          <div className="space-y-7">
            <div className="space-y-4">
              <p className="luxury-kicker">{product.category || 'Aretes'}</p>
              <h1 className="luxury-heading">{product.name}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-gold-light">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index}>{index < Math.round(rating) ? '★' : '☆'}</span>
                ))}
                <span className="ml-1 text-white/50">({reviews})</span>
              </div>
              <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${getStockClass(stockLabel)}`}>{stockLabel}</span>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <p className="text-[50px] font-medium leading-[0.95] text-transparent bg-[linear-gradient(140deg,#fff4c2_0%,#e8c84a_32%,#d4af37_62%,#9a6d12_100%)] bg-clip-text sm:text-[56px]">
                {formatCurrency(product.price)}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.28em] text-white/48">{product.unit || 'Par'}</p>
            </div>

            <ul className="grid gap-2.5">
              {BENEFITS.map((benefit) => (
                <li key={benefit.title} className="flex items-center gap-3 rounded-[18px] border border-white/6 bg-black/28 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-gold-light shadow-[0_8px_18px_rgba(212,175,55,0.12)]">
                    <Icon name={benefit.icon} className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-white">{benefit.title}</span>
                    {benefit.subtitle ? <span className="block text-xs text-white/58">{benefit.subtitle}</span> : null}
                  </span>
                </li>
              ))}
            </ul>

            <div className="rounded-[22px] border border-white/8 bg-black/26 p-4">
              <p className="mb-2 text-[11px] uppercase tracking-[0.24em] text-white/48">Cantidad</p>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-black/40 px-2 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="h-8 w-8 rounded-full border border-white/6 text-white/78 transition duration-300 ease-out hover:border-gold/35 hover:text-gold-light"
                >
                  -
                </button>
                <span className="min-w-8 text-center text-sm font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.min(99, current + 1))}
                  className="h-8 w-8 rounded-full border border-white/6 text-white/78 transition duration-300 ease-out hover:border-gold/35 hover:text-gold-light"
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
                className="luxury-btn-primary inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium uppercase tracking-[0.12em] disabled:cursor-default disabled:opacity-70"
              >
                <Icon name="bag" className="h-4 w-4" />
                AGREGAR AL CARRITO
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="luxury-btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium uppercase tracking-[0.12em]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.149-.672.15-.198.297-.767.967-.94 1.165-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.173.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.672-1.611-.921-2.207-.242-.579-.487-.5-.672-.51l-.573-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.412.248-.694.248-1.289.173-1.413-.074-.124-.273-.198-.57-.347z" />
                </svg>
                COMPRAR POR WHATSAPP
              </a>
            </div>

            <div className="grid gap-2 rounded-[22px] border border-white/8 bg-black/24 p-4 text-xs text-white/68 sm:grid-cols-2 lg:grid-cols-4">
              {FOOTER_FEATURES.map((item) => (
                <p key={item.text} className="inline-flex items-center gap-2.5">
                  <Icon name={item.icon} className="h-3.5 w-3.5 text-gold-light" />
                  <span className="uppercase tracking-[0.14em]">{item.text}</span>
                </p>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="space-y-3 pt-2">
        <h2 className="font-display text-3xl tracking-[0.01em]">Descripcion</h2>
        <p className="max-w-4xl text-sm leading-7 text-white/72">{product.description || 'Descripcion del producto no disponible.'}</p>
      </section>

      {relatedProducts.length ? (
        <section className="space-y-4 pt-2">
          <h2 className="font-display text-3xl tracking-[0.01em]">Productos relacionados</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpenProduct?.(item)}
                className="group overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-4 text-left shadow-[0_18px_48px_rgba(0,0,0,0.28)] transition duration-300 ease-out hover:-translate-y-1 hover:border-gold/35 hover:bg-white/[0.06]"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-[#131313]">
                  {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]" loading="lazy" /> : <div className="flex h-full items-center justify-center text-white/35">Sin imagen</div>}
                </div>
                <div className="mt-3 space-y-1.5">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">{item.subcategory || item.family || 'Producto'}</p>
                  <p className="line-clamp-2 text-sm font-medium text-white">{item.name}</p>
                  <p className="text-sm text-gold-light">{formatCurrency(item.price)}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {showFullscreen && activeImage ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/92 p-4 backdrop-blur-sm" onClick={() => setShowFullscreen(false)}>
          <button type="button" onClick={() => setShowFullscreen(false)} className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-white/80 transition duration-300 ease-out hover:border-gold/35 hover:text-gold-light">Cerrar</button>
          <img src={activeImage} alt={product.name} className="max-h-[90vh] max-w-[92vw] rounded-[1.5rem] object-contain shadow-[0_24px_90px_rgba(0,0,0,0.55)]" />
        </div>
      ) : null}
    </div>
  );
}

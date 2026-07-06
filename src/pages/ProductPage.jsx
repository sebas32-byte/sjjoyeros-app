import React, { useEffect, useMemo, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useProduct, getRelatedProducts } from '../hooks/useProducts.js';
import { createProductWhatsAppUrl } from '../config/business.js';

function formatCurrency(value) {
  return value ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value) : 'Precio disponible';
}

export default function ProductPage({ id }) {
  const { product, loading } = useProduct(id);
  const [activeImage, setActiveImage] = useState(null);
  const related = useMemo(() => getRelatedProducts(product), [product]);
  const { addItem } = useCart();

  useEffect(() => {
    if (!product) {
      setActiveImage(null);
      return;
    }
    setActiveImage(product.images?.[0] || product.image || null);
  }, [product]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const baseImages = Array.isArray(product.images) && product.images.length ? [...product.images] : [];
    if (product.image) baseImages.unshift(product.image);
    return Array.from(new Set(baseImages.filter(Boolean)));
  }, [product]);

  const whatsappUrl = useMemo(() => {
    if (!product) return '#';
    return createProductWhatsAppUrl(product);
  }, [product]);

  if (!id) {
    return (
      <main className="px-4 py-20">
        <p className="text-center">Producto no especificado.</p>
      </main>
    );
  }

  return (
      <main className="section-shell mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {loading ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/70">Cargando producto…</p>
          </div>
        ) : !product ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/70">No se encontró el producto.</p>
            <a href="/" className="mt-4 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white">Volver al catálogo</a>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <a href="/" className="text-sm font-semibold text-white/70 transition hover:text-white">← Volver al catálogo</a>
              <p className="text-sm text-white/60">{product.category || product.family || 'Categoría'} / {product.subcategory || 'General'}</p>
            </div>

            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="space-y-6">
                <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
                  <div className="relative aspect-[4/3] bg-[#111111]">
                    {activeImage ? (
                      <img src={activeImage} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/40">Imagen no disponible</div>
                    )}
                  </div>
                </div>
                {galleryImages.length > 1 && (
                  <div className="grid auto-cols-[5rem] grid-flow-col gap-3 overflow-x-auto pb-2">
                    {galleryImages.map((image) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() => setActiveImage(image)}
                        className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border ${activeImage === image ? 'border-gold' : 'border-white/10'} bg-white/5 transition`}
                      >
                        <img src={image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </section>

              <section className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 text-white">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.35em] text-gold">{product.family || 'Producto'}</p>
                  <h1 className="text-4xl font-semibold">{product.name}</h1>
                  <p className="text-3xl font-semibold text-gold">{formatCurrency(product.price)}</p>
                  <p className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>{product.stock > 0 ? 'Disponible' : 'Agotado'}</p>
                </div>

                <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-[#0d0d0d] p-5 text-sm">
                  <div className="flex items-center justify-between text-white/70">
                    <span>Referencia</span>
                    <span className="text-white">{product.reference || product.sku || product.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/70">
                    <span>Categoría</span>
                    <span className="text-white">{product.category || product.family || 'General'}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/70">
                    <span>Subcategoría</span>
                    <span className="text-white">{product.subcategory || 'General'}</span>
                  </div>
                  {product.materials && (
                    <div className="flex items-center justify-between text-white/70">
                      <span>Materiales</span>
                      <span className="text-white">{product.materials}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex items-center justify-between text-white/70">
                      <span>Peso</span>
                      <span className="text-white">{product.weight}</span>
                    </div>
                  )}
                  {product.size && (
                    <div className="flex items-center justify-between text-white/70">
                      <span>Tamaño</span>
                      <span className="text-white">{product.size}</span>
                    </div>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => addItem(product, 1)} className="rounded-full bg-gold px-6 py-4 text-sm font-semibold text-deep-black transition hover:bg-[#f1c93f]">
                    Agregar al carrito
                  </button>
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#1ebf5a]">
                    Comprar por WhatsApp
                  </a>
                </div>
              </section>
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Descripción</h2>
              <p className="max-w-3xl text-sm leading-7 text-white/70">{product.description || 'Descripción del producto no disponible.'}</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Productos relacionados</h2>
              {related.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {related.map((item) => (
                    <a key={item.id} href={`/product/${item.id}`} className="group overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-4 transition hover:-translate-y-1 hover:border-gold/40">
                      <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#111111]">
                        {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-white/40">Sin imagen</div>}
                      </div>
                      <div className="mt-4 space-y-2">
                        <p className="text-sm uppercase tracking-[0.28em] text-white/50">{item.subcategory || item.family || 'Producto'}</p>
                        <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                        <p className="text-sm text-gold">{formatCurrency(item.price)}</p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/60">No hay productos relacionados disponibles.</p>
              )}
            </section>
          </div>
        )}
      </main>
  );
}

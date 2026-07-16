import React, { useMemo } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useProduct, getRelatedProducts } from '../hooks/useProducts.js';
import { createProductWhatsAppUrl } from '../config/business.js';
import ProductDetailView from '../components/ProductDetailView.jsx';

export default function ProductPage({ id }) {
  const { product, loading } = useProduct(id);
  const related = useMemo(() => getRelatedProducts(product), [product]);
  const { addItem } = useCart();

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
    <main className="section-shell mx-auto max-w-7xl px-6 py-16 lg:px-8">
      {loading ? (
        <div className="space-y-6">
          <div className="h-5 w-56 animate-pulse rounded bg-white/10" />
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="aspect-[4/3] animate-pulse rounded-[2rem] bg-white/10" />
            <div className="h-[26rem] animate-pulse rounded-[2rem] bg-white/10" />
          </div>
          <div className="h-32 animate-pulse rounded-[1.5rem] bg-white/10" />
        </div>
      ) : !product ? (
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-white/70">No se encontró el producto.</p>
          <a href="/" className="mt-4 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white">Volver al catálogo</a>
        </div>
      ) : (
        <ProductDetailView
          product={product}
          relatedProducts={related}
          onAddToCart={(item, qty) => addItem(item, qty)}
          onOpenProduct={(item) => {
            if (typeof window !== 'undefined') {
              window.location.href = `/product/${item.id}`;
            }
          }}
          whatsappUrl={whatsappUrl}
          mode="store"
        />
      )}
    </main>
  );
}

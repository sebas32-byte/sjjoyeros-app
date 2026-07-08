import React, { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [addedPulse, setAddedPulse] = useState(false);

  const bgStyle = product?.image ? { backgroundImage: `url(${product.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: product?.gradient || 'linear-gradient(135deg,#2a2a2a, #0a0a0a)' };
  const reference = product?.reference || product?.sku || product?.id;
  const available = typeof product?.stock === 'number' ? product.stock > 0 : product?.available !== false;
  const label = useMemo(() => {
    if (Number(product?.stock || 0) > 0 && Number(product?.stock || 0) <= 3) return 'Últimas unidades';
    if (product?.featured) return 'Más vendido';
    const created = product?.created_at ? new Date(product.created_at) : null;
    if (created && Date.now() - created.getTime() <= 1000 * 60 * 60 * 24 * 21) return 'Nuevo';
    if (product?.collection === 'special' || normalizeSpecial(product?.name)) return 'Edición especial';
    return '';
  }, [product]);

  function normalizeSpecial(value = '') {
    return value.toString().toLowerCase().includes('special') || value.toString().toLowerCase().includes('edicion');
  }

  function handleAddItem() {
    addItem(product, 1);
    setAddedPulse(true);
    if (typeof window !== 'undefined') {
      window.setTimeout(() => setAddedPulse(false), 1200);
    }
  }

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-gold/40 hover:bg-white/10">
      <div className="relative aspect-[4/3] bg-white/5">
        <div className="h-full w-full" style={bgStyle} />
        {label ? (
          <span className="absolute left-3 top-3 rounded-full border border-gold/30 bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
            {label}
          </span>
        ) : null}
      </div>
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.32em] text-white/50">{product?.category || product?.family || 'Producto'}</p>
          <h3 className="text-xl font-semibold text-white">{product?.name || 'Producto disponible'}</h3>
          <p className="text-sm leading-6 text-white/60">{product?.description || 'Descripción breve del producto, perfecta para destacar características principales.'}</p>
        </div>

        <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-white/80">Ref:</span>
            <span>{reference}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-white/80">Disponibilidad:</span>
            <span className={available ? 'text-green-400' : 'text-red-400'}>{available ? 'Disponible' : 'Agotado'}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-white/80">Categoría:</span>
            <span>{product?.subcategory || product?.family || 'General'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-semibold text-gold">{product?.price ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(product.price) : 'Precio disponible'}</p>
          <div className="relative grid w-full gap-2 sm:flex sm:w-auto sm:grid-flow-col sm:items-center">
            <button onClick={handleAddItem} className={`w-full rounded-full bg-gold px-4 py-3 text-sm font-semibold text-deep-black transition hover:bg-[#f1c93f] sm:w-auto ${addedPulse ? 'cart-add-pulse' : ''}`}>Añadir</button>
            <a href={`/product/${product?.id}`} className="w-full rounded-full bg-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/20 sm:w-auto">Ver</a>
            {addedPulse ? (
              <span className="pointer-events-none absolute -bottom-7 left-0 text-xs text-gold/90 fade-up">Añadido al carrito</span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

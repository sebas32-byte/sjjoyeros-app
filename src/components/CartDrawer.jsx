import React, { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';

export default function CartDrawer({ onClose }) {
  const { items, removeItem, updateQty, clear } = useCart();
  const [draftQty, setDraftQty] = useState({});

  const total = items.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0);

  const inputValues = useMemo(() => {
    const values = {};
    items.forEach((item) => {
      const current = draftQty[item.id];
      values[item.id] = current ?? String(item.quantity ?? 1);
    });
    return values;
  }, [draftQty, items]);

  function commitQuantity(productId) {
    const rawValue = inputValues[productId] ?? '';
    const parsedValue = Number(rawValue);

    if (!rawValue || !Number.isFinite(parsedValue) || parsedValue <= 0) {
      removeItem(productId);
      setDraftQty((current) => {
        const next = { ...current };
        delete next[productId];
        return next;
      });
      return;
    }

    const nextQty = Math.floor(parsedValue);
    updateQty(productId, nextQty);
    setDraftQty((current) => ({ ...current, [productId]: String(nextQty) }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 md:items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-gold/20 bg-[#0b0b0b] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.48)]">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-3xl leading-[0.95] text-white">Carrito</h3>
          <button onClick={onClose} className="text-white/60">Cerrar</button>
        </div>
        <div className="mt-4 space-y-4">
          {items.length === 0 && <p className="text-white/60">Tu carrito está vacío.</p>}
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{it.name}</p>
                <p className="text-sm text-white/60">{it.price ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(it.price) : 'Precio'}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={inputValues[it.id] ?? String(it.quantity ?? 1)}
                  onFocus={(event) => event.target.select()}
                  onChange={(event) => {
                    const value = event.target.value;
                    setDraftQty((current) => ({ ...current, [it.id]: value }));
                  }}
                  onBlur={() => commitQuantity(it.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      commitQuantity(it.id);
                      event.currentTarget.blur();
                    }
                  }}
                  className="w-16 rounded-md border border-white/10 bg-white/5 p-1 text-white"
                />
                <button onClick={() => removeItem(it.id)} className="luxury-btn-danger px-3 py-1.5 text-xs">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <p className="font-semibold text-white">Total</p>
          <p className="font-semibold text-gold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(total)}</p>
        </div>
        <div className="mt-4 flex gap-3">
          <a href="/checkout" className="luxury-btn-primary px-4 py-2 font-semibold">Checkout</a>
          <button onClick={clear} className="luxury-btn-secondary px-4 py-2">Vaciar</button>
        </div>
      </div>
    </div>
  );
}

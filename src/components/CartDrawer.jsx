import React from 'react';
import { useCart } from '../context/CartContext.jsx';

export default function CartDrawer({ onClose }) {
  const { items, removeItem, updateQty, clear } = useCart();

  const total = items.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-[#0b0b0b] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Carrito</h3>
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
                <input type="number" min="1" value={it.quantity} onChange={(e) => updateQty(it.id, Math.max(1, Number(e.target.value || 1)))} className="w-16 rounded-md bg-white/5 p-1 text-white" />
                <button onClick={() => removeItem(it.id)} className="text-white/60">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <p className="font-semibold text-white">Total</p>
          <p className="font-semibold text-gold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(total)}</p>
        </div>
        <div className="mt-4 flex gap-3">
          <a href="/checkout" className="rounded-full bg-gold px-4 py-2 text-deep-black font-semibold">Checkout</a>
          <button onClick={clear} className="rounded-full border border-white/10 px-4 py-2 text-white">Vaciar</button>
        </div>
      </div>
    </div>
  );
}

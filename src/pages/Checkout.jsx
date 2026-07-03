import React, { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';

export default function Checkout() {
  const { items, clear } = useCart();
  const [submitted, setSubmitted] = useState(false);

  const total = items.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0);

  function handleSubmit(e) {
    e.preventDefault();
    // For v1 we'll simulate submission and clear cart
    setSubmitted(true);
    setTimeout(() => { clear(); }, 400);
  }

  return (
      <main className="section-shell mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-semibold mb-4">Checkout</h1>
        {submitted ? (
          <div className="rounded-[1rem] bg-white/5 p-6">
            <p className="text-white">Gracias. Tu pedido ha sido registrado (simulado).</p>
            <p className="text-white/60 mt-2">Te contactaremos para confirmar los detalles.</p>
            <a href="/" className="mt-4 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white">Volver al catálogo</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-[1rem] bg-white/5 p-4">
              <p className="text-white/60">Items en el pedido</p>
              <ul className="mt-3 space-y-2">
                {items.map((it) => (
                  <li key={it.id} className="flex items-center justify-between">
                    <span>{it.name} x {it.quantity}</span>
                    <span className="text-gold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format((it.price || 0) * it.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1rem] bg-white/5 p-4">
              <p className="text-white/60">Total</p>
              <p className="text-2xl font-semibold text-gold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(total)}</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm text-white/70">Nombre</label>
              <input required className="w-full rounded-md bg-white/5 p-3 text-white" />
              <label className="block text-sm text-white/70">Teléfono o WhatsApp</label>
              <input required className="w-full rounded-md bg-white/5 p-3 text-white" />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="rounded-full bg-gold px-6 py-3 text-deep-black font-semibold">Enviar pedido</button>
              <a href="/" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white">Cancelar</a>
            </div>
          </form>
        )}
      </main>
  );
}

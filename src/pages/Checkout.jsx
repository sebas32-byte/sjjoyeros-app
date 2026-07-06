import React, { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { createOrder } from '../admin/api.ts';

export default function Checkout() {
  const { items, clear } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const total = useMemo(() => items.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0), [items]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!items.length) {
      setError('Tu carrito está vacío.');
      return;
    }

    if (!name.trim() || !phone.trim()) {
      setError('Completa nombre y teléfono para continuar.');
      return;
    }

    setLoading(true);
    try {
      await createOrder({
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim() || null,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          reference: item.reference || item.sku || item.id,
          image: item.image || item.images?.[0] || '',
        })),
        total,
        status: 'pending',
        notes: notes.trim(),
      });
      setSubmitted(true);
      clear();
    } catch (err) {
      setError(err.message || 'No se pudo registrar el pedido.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="section-shell mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-4 text-2xl font-semibold">Checkout</h1>
      {submitted ? (
        <div className="rounded-[1rem] bg-white/5 p-6">
          <h2 className="text-2xl font-semibold text-white">¡Pedido recibido!</h2>
          <p className="mt-3 text-white/80">Gracias por comprar en SJ Joyeros.</p>
          <p className="mt-2 text-white/60">Hemos recibido correctamente tu solicitud.</p>
          <p className="mt-2 text-white/60">Nuestro equipo revisará el pedido y se comunicará contigo por WhatsApp para confirmar disponibilidad, forma de pago y envío.</p>
          <p className="mt-4 text-sm font-semibold text-gold">Estado inicial: Pendiente de confirmación.</p>
          <a href="/#catalogo" className="mt-5 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white">Continuar comprando</a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-[1rem] bg-white/5 p-4">
            <p className="text-white/60">Items en el pedido</p>
            <ul className="mt-3 space-y-2">
              {items.map((it) => (
                <li key={it.id} className="flex items-center justify-between">
                  <span>
                    {it.name} x {it.quantity}
                  </span>
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
            <input required value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-md bg-white/5 p-3 text-white" />
            <label className="block text-sm text-white/70">Teléfono o WhatsApp</label>
            <input required value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full rounded-md bg-white/5 p-3 text-white" />
            <label className="block text-sm text-white/70">Correo electrónico (opcional)</label>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-md bg-white/5 p-3 text-white" />
            <label className="block text-sm text-white/70">Notas</label>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-[100px] w-full rounded-md bg-white/5 p-3 text-white" />
          </div>

          {error ? <p className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p> : null}

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="rounded-full bg-gold px-6 py-3 font-semibold text-deep-black disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Procesando…' : 'Enviar pedido'}
            </button>
            <a href="/" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white">Cancelar</a>
          </div>
        </form>
      )}
    </main>
  );
}

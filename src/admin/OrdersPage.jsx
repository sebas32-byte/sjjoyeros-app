import React, { useEffect, useState } from 'react';
import { listOrders, updateOrderStatus } from './api.ts';

const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'processing', label: 'Procesando' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
];

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await listOrders();
      setOrders(data);
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(id, status) {
    try {
      await updateOrderStatus(id, status);
      await loadOrders();
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el pedido');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-gold">Pedidos</p>
        <h1 className="mt-2 text-3xl font-semibold">Seguimiento de órdenes</h1>
      </div>
      {error ? <p className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p> : null}
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        {loading ? <p className="text-sm text-white/60">Cargando…</p> : null}
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">Pedido #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-white/60">{order.customer_name || 'Cliente sin nombre'} · {order.customer_phone || 'Sin teléfono'}</p>
                  <p className="text-sm text-white/60">Creado: {formatDate(order.created_at)}</p>
                </div>
                <select value={order.status} onChange={(event) => handleStatusChange(order.id, event.target.value)} className="rounded-full border border-white/10 bg-black/40 px-3 py-2">
                  {ORDER_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/50">Productos</p>
                {Array.isArray(order.items) && order.items.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {order.items.map((item, index) => (
                      <li key={`${order.id}-${index}`} className="flex items-center justify-between gap-3 text-sm text-white/80">
                        <span>{item.name || 'Producto'} x {item.quantity || 1}</span>
                        <span>{formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-white/60">Sin productos registrados en este pedido.</p>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-2 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
                <p>Notas: {order.notes || 'Sin notas'}</p>
                <p className="font-semibold text-gold">Total: {formatCurrency(order.total)}</p>
              </div>
            </div>
          ))}

          {!loading && orders.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">Aún no hay pedidos registrados.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

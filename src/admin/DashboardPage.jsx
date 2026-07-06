import React from 'react';
import { Link } from 'react-router-dom';

const cards = [
  { to: '/admin/products', title: 'Productos', description: 'Crear, editar y administrar piezas.' },
  { to: '/admin/categories', title: 'Categorías', description: 'Organizar familias y subcategorías.' },
  { to: '/admin/orders', title: 'Pedidos', description: 'Revisar y actualizar estados.' },
  { to: '/admin/settings', title: 'Configuración', description: 'Ajustes básicos del panel.' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-gold">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold">Gestión operativa</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/60">Accede rápidamente a los módulos principales para administrar la tienda.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.to} to={card.to} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 transition hover:border-gold/40">
            <h2 className="text-xl font-semibold">{card.title}</h2>
            <p className="mt-3 text-sm text-white/60">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

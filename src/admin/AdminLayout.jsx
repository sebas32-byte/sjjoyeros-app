import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from './auth.ts';

const navItems = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/products', label: 'Productos' },
  { to: '/admin/categories', label: 'Categorías' },
  { to: '/admin/orders', label: 'Pedidos' },
  { to: '/admin/settings', label: 'Configuración' },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/10 bg-black/40">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-gold">SJJOYEROS</p>
              <p className="text-lg font-semibold">Panel de administración</p>
            </div>
            <button onClick={handleLogout} className="shrink-0 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-deep-black">Cerrar sesión</button>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className="shrink-0 whitespace-nowrap rounded-full border border-white/10 px-3 py-2 text-sm text-white/80 transition hover:text-gold">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

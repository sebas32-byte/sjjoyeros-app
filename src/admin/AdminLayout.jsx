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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-gold">SJJOYEROS</p>
            <p className="text-lg font-semibold">Panel de administración</p>
          </div>
          <div className="flex items-center gap-3">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className="rounded-full border border-white/10 px-3 py-2 text-sm text-white/80 transition hover:text-gold">
                {item.label}
              </Link>
            ))}
            <button onClick={handleLogout} className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-deep-black">Cerrar sesión</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

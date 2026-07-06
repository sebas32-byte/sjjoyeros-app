import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getSession } from './auth.ts';

export default function ProtectedRoute() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const session = await getSession();
      if (!cancelled) {
        setAuthed(Boolean(session));
        setLoading(false);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] text-white">Verificando sesión…</div>;
  }

  return authed ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

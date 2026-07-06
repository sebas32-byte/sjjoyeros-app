import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from './auth.ts';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await signIn(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.35em] text-gold">SJJOYEROS</p>
        <h1 className="mt-3 text-3xl font-semibold">Acceso administrador</h1>
        <p className="mt-3 text-sm text-white/60">Ingresa tus credenciales para gestionar la tienda.</p>
        <div className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-2 block text-white/70">Correo</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 outline-none" required />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-white/70">Contraseña</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 outline-none" required />
          </label>
        </div>
        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
        <button type="submit" className="mt-6 w-full rounded-full bg-gold px-4 py-3 font-semibold text-deep-black">Entrar</button>
      </form>
    </div>
  );
}

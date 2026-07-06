import React from 'react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-gold">Configuración</p>
        <h1 className="mt-2 text-3xl font-semibold">Ajustes del panel</h1>
        <p className="mt-3 text-sm text-white/60">La configuración avanzada se añadirá aquí conforme el MVP evolucione.</p>
      </div>
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <p className="text-white/70">Próximamente: branding, impuestos, envíos y preferencias de notificaciones.</p>
      </div>
    </div>
  );
}

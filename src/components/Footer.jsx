import React from 'react';
import { businessConfig, createGeneralWhatsAppUrl } from '../config/business.js';

export default function Footer() {
  return (
    <footer id="contacto" className="site-footer border-t border-white/10 bg-[#060606] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 text-white">
          <p className="text-sm uppercase tracking-[0.35em] text-gold">{businessConfig.name.toUpperCase()}</p>
          <h3 className="text-2xl font-semibold">Pulseras y accesorios con presencia premium.</h3>
          <p className="max-w-xl text-sm leading-7 text-white/60">Conecta con clientes mayoristas y particulares a través de un catálogo elegante y claro.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm uppercase tracking-[0.28em] text-white/50">Contacto</p>
            <p className="text-sm text-white/70">WhatsApp: <a href={createGeneralWhatsAppUrl()} target="_blank" rel="noreferrer" className="text-gold">Enviar mensaje</a></p>
            <p className="text-sm text-white/70">Correo: <a href={`mailto:${businessConfig.email}`} className="text-gold">{businessConfig.email}</a></p>
            {businessConfig.address ? <p className="text-sm text-white/70">Dirección: {businessConfig.address}</p> : null}
            {businessConfig.hours ? <p className="text-sm text-white/70">Horario: {businessConfig.hours}</p> : null}
          </div>
          <div className="space-y-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm uppercase tracking-[0.28em] text-white/50">Síguenos</p>
            <div className="flex flex-wrap gap-3 text-sm text-white/70">
              <a href={businessConfig.instagramUrl} target="_blank" rel="noreferrer" className="transition hover:text-gold">Instagram</a>
              <a href={businessConfig.facebookUrl} target="_blank" rel="noreferrer" className="transition hover:text-gold">Facebook</a>
              <a href={businessConfig.tiktokUrl} target="_blank" rel="noreferrer" className="transition hover:text-gold">TikTok</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

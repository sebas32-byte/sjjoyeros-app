import React from 'react';

export default function Hero() {
  return (
    <section id="inicio" className="hero-section relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.14),transparent_35%),linear-gradient(180deg,#050505_0%,#111111_100%)] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_0.9fr] lg:items-center">
          <div className="space-y-6 text-white">
            <p className="text-sm uppercase tracking-[0.35em] text-gold">Joyería moderna</p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Pulseras, balinería y accesorios con presencia premium.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
              Diseños minimalistas para venta mayorista y clientes que buscan calidad, confianza y estilo duradero.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="#catalogo" className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-deep-black transition hover:bg-gold-light">Ver productos</a>
              <a href="https://wa.me/" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10">Consultas por WhatsApp</a>
            </div>
          </div>

          <div className="relative mx-auto flex h-[24rem] w-full max-w-xl items-end overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#161616] via-[#090909] to-[#0b0b0b] shadow-glow">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.15),transparent_20%)]" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="relative z-10 p-8 text-white">
              <p className="text-sm uppercase tracking-[0.35em] text-white/40">Calidad hecha a mano</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">Acabados limpios, detalles diseñados para destacar.</h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

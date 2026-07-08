import React from 'react';

const materials = [
  { id: 'ORO', label: 'ORO' },
  { id: 'ORO LAMINADO', label: 'ORO LAMINADO' },
  { id: 'RELOJERÍA', label: 'RELOJERÍA' },
];

export default function Hero({ onSelectMaterial, selectedMaterial }) {
  return (
    <section id="inicio" className="landing-shell relative overflow-hidden px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:px-8">
      <div className={`mx-auto flex min-h-[72vh] w-full max-w-3xl flex-col items-center justify-center text-center transition-all duration-700 ${selectedMaterial ? 'scale-[0.985] opacity-60 blur-[1px]' : 'scale-100 opacity-100 blur-0'}`}>
        <div className="landing-entrance w-full">
          <div className="landing-mark-wrap landing-seq-halo mx-auto inline-flex items-center justify-center rounded-full px-4 py-2">
            <span className="landing-mark-halo" aria-hidden="true" />
            <p className="landing-seq-logo relative text-xs uppercase tracking-[0.42em] text-gold/90">SJ Joyeros</p>
          </div>
          <h1 className="landing-seq-title mt-5 text-4xl font-semibold tracking-[0.04em] text-white sm:text-5xl">Calidad que no se pela</h1>
          <div className="mx-auto mt-10 grid w-full max-w-xl gap-4">
            {materials.map((material, index) => (
              <button
                key={material.id}
                type="button"
                onClick={() => onSelectMaterial?.(material.id)}
                className="landing-material-btn landing-seq-btn rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-6 py-4 text-base font-semibold tracking-[0.28em] text-white transition hover:border-gold/45 hover:text-gold sm:py-5"
                style={{ animationDelay: `${index * 0.12 + 0.2}s` }}
              >
                {material.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

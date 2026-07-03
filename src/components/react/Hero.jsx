import React from 'react';

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="container hero-inner">
        <div className="hero-copy">
          <h1 className="hero-title">Bienvenido</h1>
          <p className="hero-subtitle">Explora nuestras piezas</p>
          <div className="hero-actions"><a className="btn-primary" href="#shop">Ver catálogo</a></div>
        </div>
        <div className="hero-media" role="img" aria-label="Imagen principal"></div>
      </div>
    </section>
  );
}

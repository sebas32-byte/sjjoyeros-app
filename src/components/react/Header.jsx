import React from 'react';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="#" className="logo-link">
          <span className="logo-mark" aria-hidden="true"></span>
          <span className="logo-text">SJJOYEROS</span>
        </a>
        <nav className="site-nav" aria-label="Main navigation">
          <button className="nav-toggle" aria-expanded="false">Menu</button>
          <ul className="nav-list">
            <li><a href="#">Inicio</a></li>
            <li><a href="#shop">Catálogo</a></li>
            <li><a href="#favorites">Favoritos</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

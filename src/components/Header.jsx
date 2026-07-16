import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';

export default function Header({ onOpenCart }) {
  const { count } = useCart();
  const [isHiddenOnMobile, setIsHiddenOnMobile] = useState(false);
  const [countPulse, setCountPulse] = useState(false);

  useEffect(() => {
    if (count <= 0) return;
    setCountPulse(true);
    const timer = window.setTimeout(() => setCountPulse(false), 280);
    return () => window.clearTimeout(timer);
  }, [count]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mobileQuery = window.matchMedia('(max-width: 1023px)');
    let lastY = window.scrollY;
    let ticking = false;

    const updateVisibility = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;

      if (Math.abs(delta) > 6) {
        if (delta > 0 && currentY > 72) {
          setIsHiddenOnMobile(true);
        } else if (delta < 0) {
          setIsHiddenOnMobile(false);
        }
        lastY = currentY;
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!mobileQuery.matches) return;
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateVisibility);
    };

    const handleResize = () => {
      if (!mobileQuery.matches) {
        setIsHiddenOnMobile(false);
      }
      lastY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <header
      className={`site-header sticky top-0 z-50 border-b border-gold/15 bg-deep-black/90 backdrop-blur-sm transition-transform duration-300 ${isHiddenOnMobile ? '-translate-y-full lg:translate-y-0' : 'translate-y-0'}`}
    >
      <div className="mx-auto flex h-[90px] max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/25 bg-black/35 text-gold-light transition hover:border-gold/45 lg:hidden"
            aria-label="Menu"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <a href="/" className="flex items-center gap-3 text-white no-underline">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold-light shadow-glow">SJ</span>
          <div className="hidden sm:block">
            <p className="font-display text-lg font-semibold uppercase tracking-[0.28em] text-gold-light">SJJOYEROS</p>
            <p className="text-[10px] uppercase tracking-[0.34em] text-gold/70">Calidad que no se pela</p>
          </div>
          </a>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-white/70 lg:flex">
          <a href="/#inicio" className="transition hover:text-gold-light">Inicio</a>
          <a href="/#catalogo" className="transition hover:text-gold-light">Catalogo</a>
          <a href="/#contacto" className="transition hover:text-gold-light">Contacto</a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/#catalogo"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/25 bg-black/35 text-gold-light transition hover:border-gold/45"
            aria-label="Buscar"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </a>
          <button
            type="button"
            onClick={onOpenCart}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/25 bg-black/35 text-sm font-semibold text-white/90 transition hover:border-gold/45 sm:h-auto sm:w-auto sm:px-3 sm:py-2"
            aria-label="Carrito"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 sm:mr-2" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="9" cy="20" r="1" />
              <circle cx="17" cy="20" r="1" />
              <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H7" />
            </svg>
            <span className="hidden sm:inline">Carrito</span>
            {count > 0 && (
              <span className={`absolute right-0 top-0 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-deep-black sm:static sm:ml-2 sm:h-6 sm:min-w-[1.5rem] sm:px-2 sm:text-xs ${countPulse ? 'cart-count-pop' : ''}`}>
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

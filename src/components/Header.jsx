import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { businessConfig, createGeneralWhatsAppUrl } from '../config/business.js';

export default function Header({ onOpenCart }) {
  const { count } = useCart();
  const [isHiddenOnMobile, setIsHiddenOnMobile] = useState(false);

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
      className={`site-header sticky top-0 z-50 border-b border-white/10 bg-deep-black/90 backdrop-blur-sm transition-transform duration-300 ${isHiddenOnMobile ? '-translate-y-full lg:translate-y-0' : 'translate-y-0'}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-3 text-white no-underline">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold shadow-glow">SJ</span>
          <div>
            <p className="text-base font-semibold uppercase tracking-[0.25em] text-white/75">{businessConfig.name}</p>
            <p className="hidden text-xs uppercase tracking-[0.35em] text-white/40 sm:block">{businessConfig.tagline}</p>
          </div>
        </a>

        <nav className="hidden items-center gap-8 lg:flex text-sm text-white/70">
          <a href="/#inicio" className="transition hover:text-gold">Inicio</a>
          <a href="/#catalogo" className="transition hover:text-gold">Catálogo</a>
          <a href="/#contacto" className="transition hover:text-gold">Contacto</a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={createGeneralWhatsAppUrl()}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-transparent bg-[#25D366] text-sm font-semibold text-white shadow-[0_8px_24px_rgba(37,211,102,0.22)] transition hover:bg-[#1ebf5a] sm:h-auto sm:w-auto sm:px-4 sm:py-3"
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 sm:mr-2" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.149-.672.15-.198.297-.767.967-.94 1.165-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.173.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.672-1.611-.921-2.207-.242-.579-.487-.5-.672-.51l-.573-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.412.248-.694.248-1.289.173-1.413-.074-.124-.273-.198-.57-.347z" />
            </svg>
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={onOpenCart}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white/80 transition hover:bg-white/10 sm:h-auto sm:w-auto sm:px-3 sm:py-2"
            aria-label="Carrito"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 sm:mr-2" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="9" cy="20" r="1" />
              <circle cx="17" cy="20" r="1" />
              <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H7" />
            </svg>
            <span className="hidden sm:inline">Carrito</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-deep-black sm:static sm:ml-2 sm:h-6 sm:min-w-[1.5rem] sm:px-2 sm:text-xs">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

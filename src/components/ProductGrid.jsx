import React, { useMemo, useRef, useState } from 'react';
import ProductCard from './ProductCard.jsx';

function normalizeText(value = '') {
  return value?.toString().toLowerCase().normalize('NFD').replace(/[^\w\s]/g, '');
}

const collectionConfig = {
  ORO: {
    displayName: 'ORO',
    familyMatcher: (family) => normalizeText(family).includes('oro') && !normalizeText(family).includes('laminado'),
    defaults: ['all', 'Pulseras', 'Cadenas', 'Dijes', 'Anillos', 'Aretes', 'Tobilleras', 'Rosarios'],
  },
  'ORO LAMINADO': {
    displayName: 'ORO LAMINADO',
    familyMatcher: (family) => normalizeText(family).includes('oro') && normalizeText(family).includes('laminado'),
    defaults: ['all', 'Pulseras', 'Cadenas', 'Dijes', 'Anillos', 'Aretes', 'Tobilleras', 'Rosarios'],
  },
  'RELOJERÍA': {
    displayName: 'RELOJERÍA',
    familyMatcher: (family) => normalizeText(family).includes('reloj'),
    defaults: ['all', 'Hombre', 'Mujer', 'Clásicos', 'Deportivos'],
  },
};

const materialTabs = ['ORO', 'ORO LAMINADO', 'RELOJERÍA'];

function productMatchesMaterial(product, selectedMaterial = '') {
  const familyValue = normalizeText(product.family || product.category || '');
  const categoryValue = normalizeText(product.category || '');

  if (selectedMaterial === 'ORO') {
    return familyValue.includes('oro') && !familyValue.includes('laminado') && !categoryValue.includes('reloj');
  }

  if (selectedMaterial === 'ORO LAMINADO') {
    return familyValue.includes('oro') && familyValue.includes('laminado');
  }

  if (selectedMaterial === 'RELOJERÍA') {
    return familyValue.includes('reloj') || categoryValue.includes('reloj');
  }

  return false;
}

function mergeSubcategories(collectionDefaults = [], catalogSubcategories = []) {
  const fromCollection = collectionDefaults;
  const fromCatalog = catalogSubcategories.filter((item) => item !== 'all');
  return Array.from(new Set(['all', ...fromCollection.filter((item) => item !== 'all'), ...fromCatalog]));
}

function getSubcategoryGlyph(label) {
  const normalized = normalizeText(label);

  if (normalized.includes('hombre')) {
    return (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <rect x="14" y="12" width="20" height="24" rx="8" />
        <path d="M18 20h12M18 27h12" />
      </svg>
    );
  }

  if (normalized.includes('mujer')) {
    return (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M24 10c5 0 9 4 9 9 0 4.8-3.8 8.8-8.4 9v4H29v3h-4.4V38h-3v-3h-4.6v-3h4.6v-6c-4.9-.6-8.6-4.5-8.6-9 0-5 4-9 9-9Z" />
      </svg>
    );
  }

  if (normalized.includes('clas')) {
    return (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <rect x="12" y="12" width="24" height="24" rx="7" />
        <path d="M16 24h16" />
      </svg>
    );
  }

  if (normalized.includes('deport')) {
    return (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M16 16h16l3 8-3 8H16l-3-8 3-8Z" />
        <path d="M20 20h8M18 29h12" />
      </svg>
    );
  }

  if (normalized.includes('cadena') || normalized.includes('cadenas')) {
    return (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M18 17h-2a7 7 0 1 0 0 14h2" />
        <path d="M30 31h2a7 7 0 1 0 0-14h-2" />
        <path d="M18 24h12" />
      </svg>
    );
  }

  if (normalized.includes('anillo')) {
    return (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <circle cx="24" cy="27" r="11" />
        <path d="M19 14l3-5h4l3 5" />
      </svg>
    );
  }

  if (normalized.includes('dije')) {
    return (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M24 11l10 6v9c0 6-4.5 10-10 11-5.5-1-10-5-10-11v-9l10-6Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M15 18c0-5 4-9 9-9s9 4 9 9-4 9-9 9-9 4-9 9" />
      <path d="M14 33c0-4 3-7 7-7h7" />
    </svg>
  );
}

function getCardTransform(index, activeIndex) {
  const distance = index - activeIndex;
  const clampedDistance = Math.max(-1, Math.min(1, distance));
  const rotateY = clampedDistance * 14;
  const scale = index === activeIndex ? 1 : 0.94;
  const translateX = clampedDistance * 16;
  const opacity = index === activeIndex ? 1 : 0.9;

  return {
    transform: `perspective(1200px) translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
    opacity,
  };
}

export default function ProductGrid({ products = [], selectedMaterial = '', onSelectMaterial }) {
  const [search, setSearch] = useState('');
  const [activeSubcategoryIndex, setActiveSubcategoryIndex] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [stockOnly, setStockOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState('all');
  const [subcategory, setSubcategory] = useState('all');
  const [sort, setSort] = useState('featured');
  const swipeStartX = useRef(0);
  const trackRef = useRef(null);
  const subcategoryRefs = useRef([]);
  const scrollRafRef = useRef(0);

  const visibleProducts = useMemo(
    () => products.filter((product) => product?.available !== false),
    [products],
  );

  const selectedCollection = useMemo(() => collectionConfig[selectedMaterial] || null, [selectedMaterial]);

  const materialProducts = useMemo(
    () => visibleProducts.filter((product) => productMatchesMaterial(product, selectedMaterial)),
    [visibleProducts, selectedMaterial],
  );

  const collectionCount = materialProducts.length;

  const catalogSubcategories = useMemo(() => {
    return Array.from(
      new Set(
        materialProducts
          .filter((product) => productMatchesMaterial(product, selectedMaterial))
          .map((product) => product.subcategory || product.category || 'General'),
      ),
    ).sort();
  }, [materialProducts, selectedMaterial]);

  const subcategories = useMemo(
    () => mergeSubcategories(selectedCollection?.defaults || ['all'], catalogSubcategories),
    [selectedCollection, catalogSubcategories],
  );

  const activeSubcategory = subcategories[activeSubcategoryIndex] || 'all';

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeText(search);
    return materialProducts
      .filter((product) => {
        const matchesSearch = normalizedSearch
          ? [product.name, product.description, product.category, product.family, product.subcategory, product.reference, product.sku]
              .filter(Boolean)
              .some((value) => normalizeText(value).includes(normalizedSearch))
          : true;
        const matchesSubcategory = subcategory === 'all' || (product.subcategory || product.category) === subcategory;
        const matchesStock = !stockOnly || Number(product.stock || 0) > 0;
        const productPrice = Number(product.price || 0);
        const matchesPrice = priceFilter === 'all'
          ? true
          : priceFilter === 'low'
            ? productPrice > 0 && productPrice < 500000
            : priceFilter === 'mid'
              ? productPrice >= 500000 && productPrice <= 900000
              : productPrice > 900000;
        return matchesSearch && matchesSubcategory && matchesStock && matchesPrice;
      })
      .sort((a, b) => {
        if (sort === 'priceAsc') return (a.price || 0) - (b.price || 0);
        if (sort === 'priceDesc') return (b.price || 0) - (a.price || 0);
        if (sort === 'newest') return (b.created_at ? new Date(b.created_at) : 0) - (a.created_at ? new Date(a.created_at) : 0);
        if (sort === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || ((b.sales_count || 0) - (a.sales_count || 0));
        return 0;
      });
  }, [materialProducts, subcategory, search, sort, stockOnly, priceFilter]);

  const handleSubcategoryScroll = () => {
    if (scrollRafRef.current) return;

    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = 0;
      const track = trackRef.current;
      if (!track) return;

      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      subcategoryRefs.current.forEach((element, index) => {
        if (!element) return;
        const elementCenter = element.offsetLeft + element.offsetWidth / 2;
        const distance = Math.abs(trackCenter - elementCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveSubcategoryIndex(closestIndex);
      setSubcategory(subcategories[closestIndex] || 'all');
    });
  };

  const handleTouchStart = (event) => {
    swipeStartX.current = event.touches?.[0]?.clientX || 0;
  };

  const handleTouchEnd = (event) => {
    const endX = event.changedTouches?.[0]?.clientX || 0;
    const diff = swipeStartX.current - endX;
    if (Math.abs(diff) < 36) return;
    setActiveSubcategoryIndex((current) => {
      const nextIndex = diff > 0 ? Math.min(current + 1, subcategories.length - 1) : Math.max(current - 1, 0);
      const element = subcategoryRefs.current[nextIndex];
      element?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      return nextIndex;
    });
  };

  React.useEffect(() => {
    setActiveSubcategoryIndex(0);
    setSubcategory('all');
    setSearch('');
    setSearchOpen(false);
    setFiltersOpen(false);
    if (trackRef.current) {
      trackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [selectedMaterial]);

  React.useEffect(() => {
    setSubcategory(activeSubcategory || 'all');
  }, [activeSubcategory]);

  if (!selectedMaterial || !selectedCollection) {
    return null;
  }

  return (
    <section id="catalogo" className="section-shell collection-entrance mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="sticky top-16 z-30 mb-8 flex justify-center sm:top-20">
        <div className="material-tabs inline-flex w-full max-w-2xl gap-2 overflow-x-auto rounded-full border border-white/10 bg-white/[0.03] p-2 shadow-[0_16px_50px_rgba(0,0,0,0.24)]">
          {materialTabs.map((tab) => {
            const isActive = tab === selectedMaterial;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onSelectMaterial?.(tab)}
                className={`material-tab-btn shrink-0 rounded-full px-4 py-2 text-sm font-semibold tracking-[0.22em] transition ${isActive ? 'active text-gold' : 'text-white/70'}`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-8 text-center sm:mb-10">
        <h2 className="text-4xl font-semibold tracking-[0.24em] text-white sm:text-5xl">{selectedCollection.displayName}</h2>
        <p className="mt-3 text-sm text-white/65">Más de {collectionCount} referencias disponibles.</p>
      </div>

      <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 sm:p-6">
        <div
          ref={trackRef}
          onScroll={handleSubcategoryScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="material-track flex snap-x snap-mandatory gap-4 overflow-x-auto px-[7vw] pb-4 pt-2"
        >
          {subcategories.map((item, index) => {
            const isActive = index === activeSubcategoryIndex;
            return (
              <article
                key={item}
                ref={(element) => {
                  subcategoryRefs.current[index] = element;
                }}
                onClick={() => {
                  setActiveSubcategoryIndex(index);
                  setSubcategory(item);
                  subcategoryRefs.current[index]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }}
                className={`material-card snap-center cursor-pointer ${isActive ? 'active' : ''}`}
                style={getCardTransform(index, activeSubcategoryIndex)}
              >
                <div className="material-card-glow" aria-hidden="true" />
                <div className="material-card-glyph text-gold/90">{getSubcategoryGlyph(item)}</div>
                <div className="mt-auto space-y-3">
                  <p className="text-xs uppercase tracking-[0.34em] text-gold/70">Subcategoría</p>
                  <h3 className="text-3xl font-semibold tracking-[0.12em] text-white sm:text-4xl">{item === 'all' ? 'TODOS' : item.toUpperCase()}</h3>
                  <p className="max-w-md text-sm leading-7 text-white/60">Desliza horizontalmente para explorar la colección con una transición suave y premium.</p>
                </div>
              </article>
            );
          })}
        </div>
        <div className="mt-1 flex items-center justify-center gap-1.5">
          {subcategories.map((item, index) => (
            <span key={`${item}-${index}`} className={`h-1.5 rounded-full transition-all ${index === activeSubcategoryIndex ? 'w-8 bg-gold' : 'w-4 bg-white/20'}`} />
          ))}
        </div>
      </div>

      <div className="sticky top-16 z-30 mb-6 flex items-center justify-center gap-3 sm:top-20">
        <button
          type="button"
          onClick={() => setSearchOpen((current) => !current)}
          className="rounded-full border border-white/10 bg-black/70 px-4 py-2 text-sm font-semibold text-white/85 backdrop-blur"
        >
          🔍 Buscar
        </button>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="rounded-full border border-white/10 bg-black/70 px-4 py-2 text-sm font-semibold text-white/85 backdrop-blur"
        >
          ⚙️ Filtros
        </button>
      </div>

      {searchOpen ? (
        <div className="mb-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o referencia"
            className="w-full rounded-full border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
          />
        </div>
      ) : null}

      {filtersOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3" onClick={() => setFiltersOpen(false)}>
          <div className="w-full max-w-xl rounded-t-[1.8rem] border border-white/10 bg-[#101010] p-5" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/20" />
            <h3 className="text-lg font-semibold text-white">Filtros</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-white/70">Ordenar</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white"
                >
                  <option value="featured">Destacados</option>
                  <option value="newest">Más recientes</option>
                  <option value="priceAsc">Precio: menor a mayor</option>
                  <option value="priceDesc">Precio: mayor a menor</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">Precio</label>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white"
                >
                  <option value="all">Todos</option>
                  <option value="low">Hasta $500.000</option>
                  <option value="mid">$500.000 a $900.000</option>
                  <option value="high">Más de $900.000</option>
                </select>
              </div>

              <label className="flex items-center gap-3 text-sm text-white/80">
                <input type="checkbox" checked={stockOnly} onChange={(e) => setStockOnly(e.target.checked)} />
                Solo disponibles en stock
              </label>

              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="mt-2 w-full rounded-full bg-gold px-4 py-3 text-sm font-semibold text-deep-black"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {filteredProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-12 text-center text-white/60">
          <p className="text-lg font-semibold text-white">No se encontraron resultados.</p>
          <p className="mt-3 text-sm leading-7">Ajusta los filtros o la búsqueda para ver más productos.</p>
        </div>
      )}
    </section>
  );
}

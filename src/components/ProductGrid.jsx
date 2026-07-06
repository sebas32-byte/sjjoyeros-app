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

function resolveCollectionFamily(families = [], selectedMaterial = '') {
  const config = collectionConfig[selectedMaterial];
  if (!config) return 'all';
  const match = families.find((family) => family !== 'all' && config.familyMatcher(family));
  return match || 'all';
}

function mergeSubcategories(collectionDefaults = [], catalogSubcategories = []) {
  const fromCollection = collectionDefaults;
  const fromCatalog = catalogSubcategories.filter((item) => item !== 'all');
  return Array.from(new Set(['all', ...fromCollection.filter((item) => item !== 'all'), ...fromCatalog]));
}

export default function ProductGrid({ products = [], selectedMaterial = '' }) {
  const [search, setSearch] = useState('');
  const [subcategoryIndex, setSubcategoryIndex] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [stockOnly, setStockOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState('all');
  const [subcategory, setSubcategory] = useState('all');
  const [sort, setSort] = useState('featured');
  const swipeStartX = useRef(0);

  const visibleProducts = useMemo(
    () => products.filter((product) => product?.available !== false),
    [products],
  );

  const families = useMemo(() => {
    const unique = Array.from(new Set(visibleProducts.map((product) => product.family || product.category || 'Otros')));
    return ['all', ...unique];
  }, [visibleProducts]);

  const family = useMemo(() => resolveCollectionFamily(families, selectedMaterial), [families, selectedMaterial]);

  const selectedCollection = useMemo(() => collectionConfig[selectedMaterial] || null, [selectedMaterial]);

  const catalogSubcategories = useMemo(() => {
    if (family === 'all') return [];
    return Array.from(
      new Set(
        visibleProducts
          .filter((product) => (product.family || product.category) === family)
          .map((product) => product.subcategory || product.category || 'General'),
      ),
    ).sort();
  }, [family, visibleProducts]);

  const subcategories = useMemo(
    () => mergeSubcategories(selectedCollection?.defaults || ['all'], catalogSubcategories),
    [selectedCollection, catalogSubcategories],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeText(search);
    return visibleProducts
      .filter((product) => {
        const matchesSearch = normalizedSearch
          ? [product.name, product.description, product.category, product.family, product.subcategory, product.reference, product.sku]
              .filter(Boolean)
              .some((value) => normalizeText(value).includes(normalizedSearch))
          : true;
        const matchesFamily = family !== 'all' && (product.family || product.category) === family;
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
        return matchesSearch && matchesFamily && matchesSubcategory && matchesStock && matchesPrice;
      })
      .sort((a, b) => {
        if (sort === 'priceAsc') return (a.price || 0) - (b.price || 0);
        if (sort === 'priceDesc') return (b.price || 0) - (a.price || 0);
        if (sort === 'newest') return (b.created_at ? new Date(b.created_at) : 0) - (a.created_at ? new Date(a.created_at) : 0);
        if (sort === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || ((b.sales_count || 0) - (a.sales_count || 0));
        return 0;
      });
  }, [family, subcategory, visibleProducts, search, sort, stockOnly, priceFilter]);

  const collectionCount = useMemo(
    () => visibleProducts.filter((product) => (product.family || product.category) === family).length,
    [visibleProducts, family],
  );

  const activeSubcategory = subcategories[subcategoryIndex] || 'all';

  const handleSubcategorySwipe = (direction) => {
    setSubcategoryIndex((current) => {
      if (direction === 'next') return Math.min(current + 1, subcategories.length - 1);
      return Math.max(current - 1, 0);
    });
  };

  const handleTouchStart = (event) => {
    swipeStartX.current = event.touches?.[0]?.clientX || 0;
  };

  const handleTouchEnd = (event) => {
    const endX = event.changedTouches?.[0]?.clientX || 0;
    const diff = swipeStartX.current - endX;
    if (Math.abs(diff) < 36) return;
    handleSubcategorySwipe(diff > 0 ? 'next' : 'prev');
  };

  React.useEffect(() => {
    setSubcategory('all');
    setSubcategoryIndex(0);
    setSearch('');
    setSearchOpen(false);
    setFiltersOpen(false);
  }, [selectedMaterial]);

  React.useEffect(() => {
    setSubcategory(activeSubcategory || 'all');
  }, [activeSubcategory]);

  if (!selectedMaterial || family === 'all' || !selectedCollection) {
    return null;
  }

  return (
    <section id="catalogo" className="section-shell collection-entrance mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center sm:mb-10">
        <h2 className="text-4xl font-semibold tracking-[0.22em] text-white sm:text-5xl">{selectedCollection.displayName}</h2>
        <p className="mt-3 text-sm text-white/65">Más de {collectionCount} referencias disponibles.</p>
      </div>

      <div className="mb-8">
        <div className="subcategory-cube-wrap rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 sm:p-6">
          <div className="cube-stage" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <article key={`${activeSubcategory}-${subcategoryIndex}`} className="cube-face-card">
              <p className="text-xs uppercase tracking-[0.34em] text-gold/70">Subcategoría</p>
              <h3 className="mt-4 text-3xl font-semibold tracking-[0.1em] text-white sm:text-4xl">{activeSubcategory === 'all' ? 'TODOS' : activeSubcategory.toUpperCase()}</h3>
              <p className="mt-3 text-sm text-white/60">Desliza horizontalmente para cambiar.</p>
            </article>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleSubcategorySwipe('prev')}
              disabled={subcategoryIndex <= 0}
              className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/70 disabled:opacity-35"
            >
              Anterior
            </button>
            <div className="flex gap-1.5">
              {subcategories.map((item, index) => (
                <span key={`${item}-${index}`} className={`h-1.5 w-6 rounded-full ${index === subcategoryIndex ? 'bg-gold' : 'bg-white/20'}`} />
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleSubcategorySwipe('next')}
              disabled={subcategoryIndex >= subcategories.length - 1}
              className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/70 disabled:opacity-35"
            >
              Siguiente
            </button>
          </div>
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

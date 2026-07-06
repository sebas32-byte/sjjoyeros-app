import React, { useMemo, useState } from 'react';
import ProductCard from './ProductCard.jsx';

function normalizeText(value = '') {
  return value?.toString().toLowerCase().normalize('NFD').replace(/[^\w\s]/g, '');
}

const collectionCards = [
  {
    key: 'oro',
    title: 'Oro',
    description: 'Joyas elaboradas en oro.',
    subcategories: ['all', 'Pulseras', 'Cadenas', 'Dijes', 'Anillos', 'Aretes', 'Tobilleras'],
  },
  {
    key: 'oro laminado',
    title: 'Oro Laminado',
    description: 'Joyas en oro laminado de excelente calidad.',
    subcategories: ['all', 'Pulseras', 'Cadenas', 'Dijes', 'Anillos', 'Aretes', 'Tobilleras'],
  },
  {
    key: 'relojes',
    title: 'Relojes',
    description: 'Relojes para diferentes estilos.',
    subcategories: ['all', 'Hombre', 'Mujer', 'Clásicos', 'Deportivos'],
  },
];

function findFamilyForCollection(families = [], collectionKey = '') {
  const normalizedTarget = normalizeText(collectionKey);
  const sortedByBestMatch = [...families]
    .filter((value) => value !== 'all')
    .sort((a, b) => {
      const aScore = normalizeText(a).includes(normalizedTarget) ? 1 : 0;
      const bScore = normalizeText(b).includes(normalizedTarget) ? 1 : 0;
      return bScore - aScore;
    });
  return sortedByBestMatch[0] || 'all';
}

export default function ProductGrid({ products = [] }) {
  const [search, setSearch] = useState('');
  const [family, setFamily] = useState('all');
  const [subcategory, setSubcategory] = useState('all');
  const [sort, setSort] = useState('featured');

  const visibleProducts = useMemo(
    () => products.filter((product) => product?.available !== false),
    [products],
  );

  const families = useMemo(() => {
    const unique = Array.from(new Set(visibleProducts.map((product) => product.family || product.category || 'Otros')));
    return ['all', ...unique];
  }, [visibleProducts]);

  const selectedCollection = useMemo(() => {
    if (family === 'all') return null;
    const normalizedFamily = normalizeText(family);
    return collectionCards.find((collection) => normalizedFamily.includes(collection.key)) || null;
  }, [family]);

  const subcategories = useMemo(() => {
    if (family === 'all') {
      return ['all', ...Array.from(new Set(visibleProducts.map((product) => product.subcategory || product.category || 'General'))).sort()];
    }
    return ['all', ...Array.from(new Set(visibleProducts.filter((product) => (product.family || product.category) === family).map((product) => product.subcategory || product.category || 'General'))).sort()];
  }, [family, visibleProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeText(search);
    return visibleProducts
      .filter((product) => {
        const matchesSearch = normalizedSearch
          ? [product.name, product.description, product.category, product.family, product.subcategory, product.reference, product.sku]
              .filter(Boolean)
              .some((value) => normalizeText(value).includes(normalizedSearch))
          : true;
        const matchesFamily = family === 'all' || (product.family || product.category) === family;
        const matchesSubcategory = subcategory === 'all' || (product.subcategory || product.category) === subcategory;
        return matchesSearch && matchesFamily && matchesSubcategory;
      })
      .sort((a, b) => {
        if (sort === 'priceAsc') return (a.price || 0) - (b.price || 0);
        if (sort === 'priceDesc') return (b.price || 0) - (a.price || 0);
        if (sort === 'newest') return (b.created_at ? new Date(b.created_at) : 0) - (a.created_at ? new Date(a.created_at) : 0);
        if (sort === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || ((b.sales_count || 0) - (a.sales_count || 0));
        return 0;
      });
  }, [family, subcategory, visibleProducts, search, sort]);

  return (
    <section id="catalogo" className="section-shell mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="section-kicker mb-3 text-sm uppercase tracking-[0.35em] text-gold">Catálogo</p>
          <h2 className="section-title text-4xl font-semibold text-white sm:text-5xl">Pulseras y accesorios diseñados para vender.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">Explora joyas reales con filtros, búsqueda y orden de producto, ahora conectadas a Supabase.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
            <span className="font-semibold text-white">{filteredProducts.length}</span> productos disponibles
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {collectionCards.map((collection) => {
            const collectionFamily = findFamilyForCollection(families, collection.key);
            const isActive = family !== 'all' && collectionFamily === family;

            return (
              <article key={collection.key} className={`rounded-[2rem] border bg-white/5 p-5 transition ${isActive ? 'border-gold/50' : 'border-white/10 hover:border-gold/30'}`}>
                <p className="text-xs uppercase tracking-[0.3em] text-gold">Colección</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">{collection.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/65">{collection.description}</p>
                <button
                  type="button"
                  onClick={() => {
                    setFamily(collectionFamily);
                    setSubcategory('all');
                  }}
                  className="mt-5 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:border-gold/40 hover:text-gold"
                >
                  Ver colección
                </button>
              </article>
            );
          })}
        </div>
      </div>

      {selectedCollection ? (
        <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/5 p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/55">Subcategorías</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {selectedCollection.subcategories
              .filter((option) => option === 'all' || subcategories.includes(option))
              .map((option) => {
                const isActive = subcategory === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSubcategory(option)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${isActive ? 'border-gold/60 bg-gold/15 text-gold' : 'border-white/10 bg-black/20 text-white/75 hover:border-gold/35'}`}
                  >
                    {option === 'all' ? 'Todos' : option}
                  </button>
                );
              })}
          </div>
        </div>
      ) : null}

      <div className="mb-8 grid gap-4 lg:grid-cols-[1.8fr_1fr]">
        <div className="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">Buscar</label>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, referencia, categoría"
              className="w-full rounded-3xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none transition focus:border-gold/40"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/80">Familia</label>
              <select
                value={family}
                onChange={(e) => { setFamily(e.target.value); setSubcategory('all'); }}
                className="w-full rounded-3xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none"
              >
                {families.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/80">Subcategoría</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none"
              >
                {subcategories.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">Ordenar</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none"
            >
              <option value="featured">Destacados</option>
              <option value="priceAsc">Precio: menor a mayor</option>
              <option value="priceDesc">Precio: mayor a menor</option>
              <option value="newest">Más nuevos</option>
            </select>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <p className="text-sm uppercase tracking-[0.35em] text-white/50">Consejo</p>
          <p className="mt-3 text-sm leading-7 text-white/60">Usa el buscador para encontrar piezas por nombre o referencia. Filtra por familia y subcategoría para acotar resultados.</p>
          <div className="mt-6 grid gap-3">
            <span className="inline-flex items-center rounded-full bg-white/5 px-4 py-3 text-sm text-white/75">Mover el catálogo en móvil es suave y rápido.</span>
            <span className="inline-flex items-center rounded-full bg-white/5 px-4 py-3 text-sm text-white/75">Las tarjetas muestran disponibilidad y acciones directas.</span>
          </div>
        </div>
      </div>

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

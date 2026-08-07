import { useEffect, useMemo, useState } from 'react';
import { listProducts } from '../admin/api.ts';
import { productCatalog } from '../data/products/index.js';
import { findCatalogProduct, getRelatedCatalogProducts, normalizeCatalogProducts } from '../services/catalogData.js';

const fallbackProducts = normalizeCatalogProducts(productCatalog);
let catalogCache = fallbackProducts;
const CATALOG_STORAGE_KEY = 'sjjoyeros_admin_products';

function updateCatalogCache(products) {
  catalogCache = normalizeCatalogProducts(products && products.length ? products : fallbackProducts);
  return catalogCache;
}

async function refreshCatalogProducts() {
  const data = await listProducts();
  return updateCatalogCache(data);
}

export function useProducts() {
  const [products, setProducts] = useState(() => catalogCache);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const data = await refreshCatalogProducts();
        if (!isMounted) return;
        setProducts(data);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        console.warn('No se pudieron cargar los productos para el storefront:', err);
        setProducts(catalogCache);
        setError(err.message || 'No se pudieron cargar los productos');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const handleCatalogChange = (event) => {
      if (event?.type === 'storage') {
        // Ignore unrelated localStorage changes (e.g. cart updates).
        if (event.key && event.key !== CATALOG_STORAGE_KEY) return;
      }
      void loadProducts();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('sjjoyeros-catalog-updated', handleCatalogChange);
      window.addEventListener('storage', handleCatalogChange);
    }

    void loadProducts();

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('sjjoyeros-catalog-updated', handleCatalogChange);
        window.removeEventListener('storage', handleCatalogChange);
      }
    };
  }, []);

  return useMemo(() => ({ products, loading, error }), [products, loading, error]);
}

export function useProduct(id) {
  const [product, setProduct] = useState(() => findCatalogProduct(catalogCache, id) || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct(forceRefresh = false) {
      const cachedProduct = findCatalogProduct(catalogCache, id) || null;
      if (!forceRefresh && cachedProduct) {
        if (!isMounted) return;
        setProduct(cachedProduct);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        const data = await refreshCatalogProducts();
        if (!isMounted) return;
        const nextProduct = findCatalogProduct(data, id) || cachedProduct || null;
        setProduct(nextProduct);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        console.warn('No se pudo cargar el producto para el storefront:', err);
        setProduct(cachedProduct || null);
        setError(err.message || 'No se pudo cargar el producto');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const handleCatalogChange = (event) => {
      if (event?.type === 'storage') {
        if (event.key && event.key !== CATALOG_STORAGE_KEY) return;
      }
      void loadProduct(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('sjjoyeros-catalog-updated', handleCatalogChange);
      window.addEventListener('storage', handleCatalogChange);
    }

    void loadProduct(false);

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('sjjoyeros-catalog-updated', handleCatalogChange);
        window.removeEventListener('storage', handleCatalogChange);
      }
    };
  }, [id]);

  return useMemo(() => ({ product, loading, error }), [product, loading, error]);
}

export function getProductById(id) {
  return findCatalogProduct(catalogCache, id);
}

export function getRelatedProducts(product, limit = 4) {
  return getRelatedCatalogProducts(catalogCache, product, limit);
}

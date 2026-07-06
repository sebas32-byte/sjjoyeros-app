import { useMemo, useState } from 'react';
import { productCatalog, getProductById, getRelatedProducts } from '../data/products/index.js';

export function useProducts() {
  const [products] = useState(productCatalog);

  return useMemo(() => ({ products, loading: false, error: null }), [products]);
}

export function useProduct(id) {
  const [product] = useState(() => getProductById(id) || null);

  return useMemo(() => ({ product, loading: false, error: null }), [product]);
}

export { getProductById, getRelatedProducts };

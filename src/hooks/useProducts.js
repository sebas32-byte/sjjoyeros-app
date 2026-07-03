import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';
import { productCatalog, getProductById, getRelatedProducts } from '../data/products/index.js';

export function useProducts() {
  const [products, setProducts] = useState(productCatalog);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      setLoading(true);
      try {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured');
        }

        const { data, error: fetchError } = await supabase
          .from('products')
          .select(
            'id,name,sku,slug,category,subcategory,family,price,stock,reference,old_price,description,short_description,image,images,featured,sales_count,available,material,weight,created_at'
          )
          .limit(100);

        if (fetchError) {
          throw fetchError;
        }

        if (mounted) {
          setProducts(Array.isArray(data) && data.length ? data : productCatalog);
          setError(null);
        }
      } catch (loadError) {
        if (mounted) {
          setProducts(productCatalog);
          setError(loadError);
          if (isSupabaseConfigured) {
            console.error('[useProducts] load error', loadError);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  return { products, loading, error };
}

export function useProduct(id) {
  const [product, setProduct] = useState(() => getProductById(id) || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      if (!id) {
        if (mounted) {
          setProduct(null);
          setLoading(false);
        }
        return;
      }

      try {
        if (!isSupabaseConfigured) {
          throw new Error('Supabase is not configured');
        }

        const { data, error: fetchError } = await supabase
          .from('products')
          .select(
            'id,name,sku,slug,category,subcategory,family,price,stock,reference,old_price,description,short_description,image,images,featured,sales_count,available,material,weight,created_at'
          )
          .eq('id', id)
          .limit(1);

        if (fetchError) {
          throw fetchError;
        }

        const item = Array.isArray(data) ? data[0] : data;
        if (mounted) {
          setProduct(item || getProductById(id) || null);
          setError(null);
        }
      } catch (loadError) {
        if (mounted) {
          setProduct(getProductById(id) || null);
          setError(loadError);
          if (isSupabaseConfigured) {
            console.error('[useProduct] load error', loadError);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [id]);

  return { product, loading, error };
}

export { getProductById, getRelatedProducts };

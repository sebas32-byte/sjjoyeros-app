import { createClient } from '@supabase/supabase-js';

let supabase = null;

async function loadConfig() {
  try {
    // Prefer user-provided config.js
    const cfg = await import('./config.js');
    return cfg;
  } catch (err) {
    // Fallback to sample (non-sensitive placeholder)
    const sample = await import('./config.sample.js');
    return sample;
  }
}

async function initClient() {
  if (supabase) return supabase;
  const cfg = await loadConfig();
  const url = cfg.SUPABASE_URL;
  const key = cfg.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase config missing. Create js/config.js from js/config.sample.js');
  supabase = createClient(url, key);
  return supabase;
}

export async function getProducts({ limit = 1000, filter = {} } = {}) {
  const client = await initClient();
  let query = client.from('products').select('*').limit(limit);
  Object.keys(filter || {}).forEach((k) => {
    const v = filter[k];
    if (v === null) return;
    query = query.eq(k, v);
  });
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getCategories() {
  const client = await initClient();
  const { data, error } = await client.from('products').select('family').neq('family', '').order('family');
  if (error) throw error;
  const families = Array.from(new Set((data || []).map((r) => r.family))).filter(Boolean);
  return families;
}

export async function getSubcategories(family) {
  const client = await initClient();
  const { data, error } = await client.from('products').select('subcategory').eq('family', family);
  if (error) throw error;
  const subs = Array.from(new Set((data || []).map((r) => r.subcategory))).filter(Boolean);
  return subs;
}

export async function getFeaturedProducts(limit = 6) {
  const client = await initClient();
  const { data, error } = await client.from('products').select('*').eq('featured', true).order('sales_count', { ascending: false }).limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getTopSellers(limit = 6) {
  const client = await initClient();
  const { data, error } = await client.from('products').select('*').order('sales_count', { ascending: false }).limit(limit);
  if (error) throw error;
  return data || [];
}

export default {
  initClient,
  getProducts,
  getCategories,
  getSubcategories,
  getFeaturedProducts,
  getTopSellers
};

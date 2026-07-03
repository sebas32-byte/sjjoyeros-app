import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase.js';

let supabase = null;
function getClient() {
  if (supabase) return supabase;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Supabase config missing');
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { realtime: { params: { events: ['INSERT','UPDATE','DELETE'] } } });
  return supabase;
}

export async function getProducts() {
  const client = getClient();
  const { data, error } = await client.from('products').select('*');
  if (error) throw error;
  return data || [];
}

export async function getFeaturedProducts(limit = 6) {
  const client = getClient();
  const { data, error } = await client.from('products').select('*').eq('featured', true).order('sales_count', { ascending: false }).limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getBestSellerProducts(limit = 6) {
  const client = getClient();
  const { data, error } = await client.from('products').select('*').order('sales_count', { ascending: false }).limit(limit);
  if (error) throw error;
  return data || [];
}

export function subscribeToProducts(onChange) {
  const client = getClient();
  const channel = client.channel('public:products');
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
    if (typeof onChange === 'function') onChange(payload);
  });
  channel.subscribe();
  return async () => {
    try { await client.removeChannel(channel); } catch (e) { /* ignore */ }
  };
}

export default { getProducts, getFeaturedProducts, getBestSellerProducts, subscribeToProducts };

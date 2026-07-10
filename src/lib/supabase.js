import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

function normalizeUrl(url = '') {
  if (!url) return '';
  const trimmedUrl = url.trim();
  const match = trimmedUrl.match(/^(https?:\/\/[^/]+)/);
  if (match) return match[1];
  return trimmedUrl;
}

export const supabaseUrl = normalizeUrl(rawUrl);
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && /^https?:\/\//.test(supabaseUrl));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export default supabase;

import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function normalizeUrl(url = '') {
  if (!url) return url;
  const trimmedUrl = url.trim();
  const match = trimmedUrl.match(/^(https?:\/\/[^/]+)/);
  if (match) return match[1];
  return trimmedUrl;
}

const supabaseUrl = normalizeUrl(rawUrl);
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && /^https?:\/\//.test(supabaseUrl));

if (!isSupabaseConfigured) {
  console.warn('[supabase] Missing or invalid env vars VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

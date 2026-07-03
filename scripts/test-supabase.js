import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const rawUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

function normalizeUrl(u) {
  try {
    const parsed = new URL(u);
    return parsed.origin; // keep protocol + host
  } catch (e) {
    return u;
  }
}

async function run() {
  console.log('Supabase test starting...');
  if (!rawUrl || !anonKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment. Check .env');
    process.exit(2);
  }

  const usedUrl = rawUrl.includes('/rest') ? normalizeUrl(rawUrl) : rawUrl;
  if (usedUrl !== rawUrl) console.warn('Warning: VITE_SUPABASE_URL appears to include a REST path. Using', usedUrl, 'for the client (will not modify .env).');

  const supabase = createClient(usedUrl, anonKey);

  try {
    console.log('Running test query: select id from products limit 1');
    const { data, error } = await supabase.from('products').select('id').limit(1);
    if (error) {
      console.error('Query error:', error.message || error);
      process.exit(3);
    }
    console.log('Query success. Rows returned:', Array.isArray(data) ? data.length : 0);
    console.log('Sample rows:', data);
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err.message || err);
    process.exit(4);
  }
}

run();

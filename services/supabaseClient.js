import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase.js';

let client = null;

export function getClient() {
  if (client) return client;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[Supabase] Missing configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env or create config/config.js');
    throw new Error('Supabase configuration missing');
  }
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { realtime: { params: { events: ['INSERT','UPDATE','DELETE'] } } });
  return client;
}

export async function testConnection() {
  try {
    const c = getClient();
    console.info('[Supabase] Testing connection to', SUPABASE_URL);
    // Intentar leer un registro pequeño para comprobar acceso
    const { data, error } = await c.from('products').select('id').limit(1);
    if (error) {
      console.error('[Supabase] Test query error:', error.message || error);
      return { ok: false, error };
    }
    console.info('[Supabase] Test query success, rows:', Array.isArray(data) ? data.length : 0);
    return { ok: true, rows: data };
  } catch (err) {
    console.error('[Supabase] Connection failed:', err.message || err);
    return { ok: false, error: err };
  }
}

export async function diagnostics() {
  const result = { url: SUPABASE_URL ? true : false, key: SUPABASE_ANON_KEY ? true : false, test: null };
  if (!result.url || !result.key) {
    console.warn('[Supabase] Missing env vars:', { VITE_SUPABASE_URL: !!SUPABASE_URL, VITE_SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY });
    return result;
  }
  result.test = await testConnection();
  return result;
}

export default { getClient, testConnection, diagnostics };

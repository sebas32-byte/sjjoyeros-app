import { supabase } from '../lib/supabase.js';

const SESSION_STORAGE_KEY = 'sjjoyeros_admin_session';

function getFallbackCredentials() {
  const email = import.meta.env.VITE_ADMIN_EMAIL?.trim();
  const password = import.meta.env.VITE_ADMIN_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error('Configura VITE_ADMIN_EMAIL y VITE_ADMIN_PASSWORD o habilita Supabase para entrar al panel');
  }
  return { email, password };
}

function readStoredSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('No se pudo leer la sesión local:', error);
    return null;
  }
}

function writeStoredSession(session) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function clearStoredSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function signIn(email: string, password: string) {
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        return data;
      }

      // Credenciales inválidas en Supabase deben mantenerse como error real.
      const authErrorStatus = (error as any)?.status;
      if (authErrorStatus === 400 || authErrorStatus === 401 || authErrorStatus === 422) {
        throw error;
      }

      console.warn('Supabase no disponible para login, usando respaldo local:', error);
    } catch (error) {
      console.warn('Supabase no disponible para login, usando respaldo local:', error);
    }
  }

  const fallback = getFallbackCredentials();
  if (email.toLowerCase() === fallback.email.toLowerCase() && password === fallback.password) {
    const session = { email, authenticatedAt: new Date().toISOString() };
    writeStoredSession(session);
    return { user: { email, id: 'local-admin' }, session };
  }

  throw new Error('Credenciales inválidas');
}

export async function signOut() {
  if (supabase) {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('No se pudo cerrar sesión en Supabase, limpiando sesión local:', error);
      }
    } catch (error) {
      console.warn('No se pudo cerrar sesión en Supabase, limpiando sesión local:', error);
    }
  }
  clearStoredSession();
}

export async function getSession() {
  if (supabase) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session) return session;
      console.warn('No se pudo leer sesión de Supabase, usando sesión local:', error);
    } catch (error) {
      console.warn('No se pudo leer sesión de Supabase, usando sesión local:', error);
    }
  }
  return readStoredSession();
}

export async function getUser() {
  if (supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) return user;
      console.warn('No se pudo leer usuario de Supabase, usando usuario local:', error);
    } catch (error) {
      console.warn('No se pudo leer usuario de Supabase, usando usuario local:', error);
    }
  }
  const session = readStoredSession();
  return session ? { id: 'local-admin', email: session.email } : null;
}

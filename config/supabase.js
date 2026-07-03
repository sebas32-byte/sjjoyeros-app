// Configuración de Supabase para el frontend.
// En Vite coloca variables en .env como VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
// Este archivo prioriza import.meta.env y luego cae en el sample.
import * as sample from './config.sample.js';

const url = import.meta.env.VITE_SUPABASE_URL || sample.SUPABASE_URL || '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || sample.SUPABASE_ANON_KEY || '';

export const SUPABASE_URL = url;
export const SUPABASE_ANON_KEY = key;


import { supabase } from '../lib/supabase.js';
import type { Category, Product, Order } from './types.js';
import {
  createLocalCategory,
  createLocalOrder,
  createLocalProduct,
  deleteLocalCategory,
  deleteLocalProduct,
  getLocalCategories,
  getLocalOrders,
  getLocalProducts,
  updateLocalCategory,
  updateLocalOrderStatus,
  updateLocalProduct,
} from './dataStore.ts';

function isSupabaseReady() {
  return Boolean(supabase);
}

const SUPABASE_TIMEOUT_MS = 4000;

async function withTimeout<T>(promise: Promise<T>, timeoutMs = SUPABASE_TIMEOUT_MS) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Supabase timeout (${timeoutMs}ms)`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function notifyCatalogChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sjjoyeros-catalog-updated'));
  }
}

async function withSupabase<T>(operation: () => Promise<T>, fallback: () => Promise<T>) {
  if (!isSupabaseReady()) {
    return fallback();
  }

  try {
    return await withTimeout(operation());
  } catch (error) {
    console.warn('Supabase no disponible, usando respaldo local:', error);
    return fallback();
  }
}

export async function listCategories() {
  return withSupabase(async () => {
    const client = supabase!;
    const { data, error } = await client.from('categories').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Category[];
  }, async () => getLocalCategories() as Category[]);
}

export async function createCategory(payload: Partial<Category>) {
  return withSupabase(async () => {
    const client = supabase!;
    const { data, error } = await client.from('categories').insert(payload).select().single();
    if (error) throw error;
    notifyCatalogChanged();
    return data as Category;
  }, async () => createLocalCategory(payload) as Category);
}

export async function updateCategory(id: string, payload: Partial<Category>) {
  return withSupabase(async () => {
    const client = supabase!;
    const { data, error } = await client.from('categories').update(payload).eq('id', id).select().single();
    if (error) throw error;
    notifyCatalogChanged();
    return data as Category;
  }, async () => updateLocalCategory(id, payload) as Category);
}

export async function deleteCategory(id: string) {
  return withSupabase(async () => {
    const client = supabase!;
    const { error } = await client.from('categories').delete().eq('id', id);
    if (error) throw error;
    notifyCatalogChanged();
  }, async () => {
    deleteLocalCategory(id);
    notifyCatalogChanged();
  });
}

export async function listProducts() {
  return withSupabase(async () => {
    const client = supabase!;
    const { data, error } = await client.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Product[];
  }, async () => getLocalProducts() as Product[]);
}

export async function createProduct(payload: Partial<Product>) {
  return withSupabase(async () => {
    const client = supabase!;
    const { data, error } = await client.from('products').insert(payload).select().single();
    if (error) throw error;
    notifyCatalogChanged();
    return data as Product;
  }, async () => createLocalProduct(payload) as Product);
}

export async function updateProduct(id: string, payload: Partial<Product>) {
  return withSupabase(async () => {
    const client = supabase!;
    const { data, error } = await client.from('products').update(payload).eq('id', id).select().single();
    if (error) throw error;
    notifyCatalogChanged();
    return data as Product;
  }, async () => updateLocalProduct(id, payload) as Product);
}

export async function deleteProduct(id: string) {
  return withSupabase(async () => {
    const client = supabase!;
    const { error } = await client.from('products').delete().eq('id', id);
    if (error) throw error;
    notifyCatalogChanged();
  }, async () => {
    deleteLocalProduct(id);
    notifyCatalogChanged();
  });
}

export async function listOrders() {
  return withSupabase(async () => {
    const client = supabase!;
    const { data, error } = await client.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Order[];
  }, async () => getLocalOrders() as Order[]);
}

export async function updateOrderStatus(id: string, status: Order['status']) {
  return withSupabase(async () => {
    const client = supabase!;
    const { data, error } = await client.from('orders').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data as Order;
  }, async () => updateLocalOrderStatus(id, status as string) as Order);
}

export async function createOrder(payload: Partial<Order>) {
  return withSupabase(async () => {
    const client = supabase!;
    const { data, error } = await client.from('orders').insert(payload).select().single();
    if (error) throw error;
    return data as Order;
  }, async () => createLocalOrder(payload) as Order);
}

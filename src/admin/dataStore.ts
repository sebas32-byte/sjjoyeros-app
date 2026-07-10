import { productCatalog } from '../data/products/index.js';

const PRODUCT_STORAGE_KEY = 'sjjoyeros_admin_products';
const CATEGORY_STORAGE_KEY = 'sjjoyeros_admin_categories';
const ORDER_STORAGE_KEY = 'sjjoyeros_admin_orders';

function readStorage(key: string, fallback: unknown) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn('No se pudo leer almacenamiento local:', error);
    return fallback;
  }
}

function notifyCatalogChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('sjjoyeros-catalog-updated'));
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    notifyCatalogChanged();
  } catch (error) {
    console.warn('No se pudo guardar almacenamiento local:', error);
  }
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeProduct(input: any) {
  const normalizedImages = Array.isArray(input.images)
    ? input.images.filter(Boolean)
    : (input.image ? [input.image] : []);

  return {
    id: input.id || createId('product'),
    name: input.name || 'Producto sin nombre',
    slug: input.slug || (input.name || 'producto').toLowerCase().replace(/\s+/g, '-'),
    sku: input.sku || '',
    category: input.category || 'General',
    description: input.description || input.short_description || '',
    short_description: input.short_description || input.description || '',
    price: Number(input.price || 0),
    stock: Number(input.stock || 0),
    available: input.available !== false,
    featured: Boolean(input.featured),
    image: input.image || normalizedImages[0] || '',
    images: normalizedImages,
    image_paths: Array.isArray(input.image_paths) ? input.image_paths.filter(Boolean) : [],
    material: input.material || '',
    family: input.family || '',
    subcategory: input.subcategory || '',
    reference: input.reference || input.sku || '',
    bead_size: input.bead_size || '',
    inventory_status: input.inventory_status || (input.available !== false ? 'Disponible' : 'Agotado'),
    description_template: input.description_template || '',
    created_at: input.created_at || new Date().toISOString(),
    ...input,
  };
}

function normalizeCategory(input: any) {
  return {
    id: input.id || createId('category'),
    name: input.name || 'Categoría',
    slug: input.slug || (input.name || 'categoria').toLowerCase().replace(/\s+/g, '-'),
    description: input.description || '',
    image: input.image || '',
    created_at: input.created_at || new Date().toISOString(),
    ...input,
  };
}

export function getLocalProducts() {
  const stored = readStorage(PRODUCT_STORAGE_KEY, null);
  if (stored && Array.isArray(stored) && stored.length) {
    return stored.map(normalizeProduct);
  }
  const seeded = productCatalog.map((product) => normalizeProduct(product));
  writeStorage(PRODUCT_STORAGE_KEY, seeded);
  return seeded;
}

export function saveLocalProducts(products: any[]) {
  const normalized = products.map(normalizeProduct);
  writeStorage(PRODUCT_STORAGE_KEY, normalized);
  return normalized;
}

export function createLocalProduct(input: any) {
  const products = getLocalProducts();
  const created = normalizeProduct({ ...input, id: input.id || createId('product') });
  const next = [created, ...products];
  saveLocalProducts(next);
  return created;
}

export function updateLocalProduct(id: string, input: any) {
  const products = getLocalProducts();
  const next = products.map((product) => (product.id === id ? normalizeProduct({ ...product, ...input, id }) : product));
  saveLocalProducts(next);
  return next.find((product) => product.id === id) || null;
}

export function deleteLocalProduct(id: string) {
  const products = getLocalProducts();
  const next = products.filter((product) => product.id !== id);
  saveLocalProducts(next);
  return next;
}

export function getLocalCategories() {
  const stored = readStorage(CATEGORY_STORAGE_KEY, null);
  if (stored && Array.isArray(stored) && stored.length) {
    return stored.map(normalizeCategory);
  }
  const seeded = [
    { id: createId('category'), name: 'Anillos', slug: 'anillos', description: 'Piezas icónicas para ocasiones especiales.', image: '' },
    { id: createId('category'), name: 'Pulseras', slug: 'pulseras', description: 'Diseños delicados y modernos.', image: '' },
  ];
  writeStorage(CATEGORY_STORAGE_KEY, seeded);
  return seeded;
}

export function saveLocalCategories(categories: any[]) {
  const normalized = categories.map(normalizeCategory);
  writeStorage(CATEGORY_STORAGE_KEY, normalized);
  return normalized;
}

export function createLocalCategory(input: any) {
  const categories = getLocalCategories();
  const created = normalizeCategory({ ...input, id: input.id || createId('category') });
  const next = [created, ...categories];
  saveLocalCategories(next);
  return created;
}

export function updateLocalCategory(id: string, input: any) {
  const categories = getLocalCategories();
  const next = categories.map((category) => (category.id === id ? normalizeCategory({ ...category, ...input, id }) : category));
  saveLocalCategories(next);
  return next.find((category) => category.id === id) || null;
}

export function deleteLocalCategory(id: string) {
  const categories = getLocalCategories();
  const next = categories.filter((category) => category.id !== id);
  saveLocalCategories(next);
  return next;
}

export function getLocalOrders() {
  const stored = readStorage(ORDER_STORAGE_KEY, []);
  return Array.isArray(stored) ? stored : [];
}

export function saveLocalOrders(orders: any[]) {
  writeStorage(ORDER_STORAGE_KEY, orders);
  return orders;
}

export function createLocalOrder(order: any) {
  const orders = getLocalOrders();
  const created = { id: order.id || createId('order'), ...order, created_at: order.created_at || new Date().toISOString() };
  const next = [created, ...orders];
  saveLocalOrders(next);
  return created;
}

export function updateLocalOrderStatus(id: string, status: string) {
  const orders = getLocalOrders();
  const next = orders.map((order) => (order.id === id ? { ...order, status } : order));
  saveLocalOrders(next);
  return next.find((order) => order.id === id) || null;
}

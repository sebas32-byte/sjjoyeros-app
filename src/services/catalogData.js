function normalizeProduct(product) {
  const images = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : [];
  const fallbackImage = product.image || images[0] || '';

  return {
    ...product,
    id: product.id?.toString() || '',
    slug: product.slug || product.name?.toLowerCase().replace(/\s+/g, '-') || '',
    category: product.category || product.family || 'General',
    subcategory: product.subcategory || product.category || 'General',
    family: product.family || product.category || 'General',
    available: product.available !== false,
    stock: Number(product.stock || 0),
    price: Number(product.price || 0),
    reference: product.reference || product.sku || product.id || '',
    description: product.description || product.short_description || '',
    short_description: product.short_description || product.description || '',
    image: fallbackImage,
    images: images.length ? images : (fallbackImage ? [fallbackImage] : []),
  };
}

export function normalizeCatalogProducts(products = []) {
  return Array.isArray(products) ? products.map(normalizeProduct) : [];
}

export function findCatalogProduct(products = [], identifier) {
  if (!identifier) return null;
  return normalizeCatalogProducts(products).find((product) => product.id === identifier || product.slug === identifier);
}

export function getRelatedCatalogProducts(products = [], product, limit = 4) {
  if (!product) return [];
  return normalizeCatalogProducts(products)
    .filter((item) => item.id !== product.id && item.category === product.category && item.available !== false)
    .slice(0, limit);
}

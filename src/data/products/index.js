import { productTemplate } from './product.types.js';

/**
 * La fuente única de productos de la aplicación.
 * Aquí se agrega el catálogo real o los productos de respaldo.
 * Reemplaza este arreglo por los datos definitivos del inventario.
 * @type {Product[]}
 */
export const productCatalog = [];

/**
 * Retorna un producto por id.
 * @param {string} id
 * @returns {Product|undefined}
 */
export function getProductById(id) {
  return productCatalog.find((product) => product.id === id);
}

/**
 * Retorna un producto por slug.
 * @param {string} slug
 * @returns {Product|undefined}
 */
export function getProductBySlug(slug) {
  return productCatalog.find((product) => product.slug === slug);
}

/**
 * Retorna productos relacionados por categoría.
 * @param {Product} product
 * @param {number} limit
 * @returns {Product[]}
 */
export function getRelatedProducts(product, limit = 4) {
  if (!product || !product.category) return [];
  return productCatalog
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, limit);
}

export { productTemplate };

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} sku
 * @property {string} slug
 * @property {string} name
 * @property {string} category
 * @property {string} subcategory
 * @property {number|null} price
 * @property {number|null} oldPrice
 * @property {string} shortDescription
 * @property {string} description
 * @property {string[]} images
 * @property {string} image
 * @property {string} material
 * @property {string} weight
 * @property {boolean} available
 * @property {boolean} featured
 * @property {boolean} isNew
 * @property {boolean} onSale
 * @property {number} stock
 * @property {string[]} tags
 * @property {number} order
 * @property {string} inventoryStatus
 */

/**
 * Estructura base para un producto.
 * No coloque datos reales aquí: utilice esta plantilla para construir el inventario.
 * @type {Product}
 */
export const productTemplate = {
  id: '',
  sku: '',
  slug: '',
  name: '',
  category: '',
  subcategory: '',
  price: null,
  oldPrice: null,
  shortDescription: '',
  description: '',
  images: [],
  image: '',
  material: '',
  weight: '',
  available: false,
  featured: false,
  isNew: false,
  onSale: false,
  stock: 0,
  tags: [],
  order: 0,
  inventoryStatus: '',
};

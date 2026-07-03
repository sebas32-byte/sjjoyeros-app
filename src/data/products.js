export const productCatalog = [];

// Este archivo define la estructura de datos del catálogo.
// Reemplaza los elementos de prueba con el inventario real.
// Cada producto debe incluir al menos:
// - id
// - name
// - reference
// - category
// - subcategory
// - price
// - description
// - material
// - weight
// - available
// - stock
// - image
// - images
// - tags
// - inventoryStatus

export const productTemplate = {
  id: '',
  name: '',
  reference: '',
  sku: '',
  category: '',
  subcategory: '',
  family: '',
  price: null,
  stock: 0,
  available: false,
  description: '',
  material: '',
  weight: '',
  dimensions: '',
  images: [],
  image: '',
  tags: [],
  inventoryStatus: '',
  featured: false,
  sales_count: 0,
};

export default productCatalog;

import test from 'node:test';
import assert from 'node:assert/strict';
import { findCatalogProduct, getRelatedCatalogProducts } from './catalogData.js';

test('findCatalogProduct resolves a product by id or slug and returns related items', () => {
  const products = [
    { id: '1', slug: 'anillo-aurora', name: 'Anillo Aurora', category: 'Anillos', price: 100000 },
    { id: '2', slug: 'pulsera-oro', name: 'Pulsera Oro', category: 'Anillos', price: 200000 },
    { id: '3', slug: 'cadena-plata', name: 'Cadena Plata', category: 'Cadenas', price: 300000 },
  ];

  assert.equal(findCatalogProduct(products, '1').name, 'Anillo Aurora');
  assert.equal(findCatalogProduct(products, 'anillo-aurora').name, 'Anillo Aurora');
  assert.deepEqual(getRelatedCatalogProducts(products, products[0], 2).map((product) => product.id), ['2']);
});

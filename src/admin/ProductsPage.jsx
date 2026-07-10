import React, { useEffect, useMemo, useState } from 'react';
import { createProduct, deleteProduct, listCategories, listProducts, updateProduct } from './api.ts';
import {
  BALIN_OPTIONS,
  COLLECTION_OPTIONS,
  DEFAULT_PRODUCT_TYPES,
  PRODUCT_STATUS_OPTIONS,
  generateDescriptionFromTemplate,
  generateReference,
  generateSku,
  getDescriptionTemplateOptions,
  inferStatus,
  toAvailability,
  toSlug,
} from './productAutomation.js';

const emptyProduct = {
  name: '',
  slug: '',
  sku: '',
  category: '',
  description: '',
  short_description: '',
  price: 0,
  stock: 0,
  available: true,
  featured: false,
  image: '',
  family: '',
  subcategory: '',
  reference: '',
  inventory_status: 'Disponible',
  bead_size: '',
  description_template: '',
  imagesText: '',
};

function parseImagesText(value = '') {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toImagesText(images = [], image = '') {
  const source = Array.isArray(images) && images.length ? images : (image ? [image] : []);
  return source.join('\n');
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const descriptionTemplateOptions = useMemo(() => getDescriptionTemplateOptions(), []);

  const collectionOptions = useMemo(() => {
    const knownCollections = products
      .map((product) => (product?.family || '').trim())
      .filter(Boolean);
    return Array.from(new Set([...COLLECTION_OPTIONS, ...knownCollections]));
  }, [products]);

  const productTypeOptions = useMemo(() => {
    const knownTypes = products
      .filter((product) => !form.category || product.category === form.category)
      .map((product) => (product?.subcategory || '').trim())
      .filter(Boolean);
    return Array.from(new Set([...DEFAULT_PRODUCT_TYPES, ...knownTypes]));
  }, [products, form.category]);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await listProducts();
      setProducts(data);
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await listCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('No se pudieron cargar las categorías:', err);
      setCategories([]);
    }
  }

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const parsedImages = parseImagesText(form.imagesText || '');
      const image = parsedImages[0] || form.image || '';
      const slug = toSlug(form.name || form.slug || '');
      const reference = generateReference(products, form.category, editingId ? form.reference : '');
      const sku = generateSku(products, form.category, editingId ? form.sku : '');
      const inventoryStatus = form.inventory_status || 'Disponible';
      const payload = {
        ...form,
        slug,
        reference,
        sku,
        inventory_status: inventoryStatus,
        available: toAvailability(inventoryStatus),
        images: parsedImages,
        image,
      };
      delete payload.imagesText;

      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      setForm(emptyProduct);
      setEditingId(null);
      await loadProducts();
    } catch (err) {
      setError(err.message || 'No se pudo guardar el producto');
    }
  }

  async function handleDelete(id) {
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el producto');
    }
  }

  function handleEdit(product) {
    setEditingId(product.id);
    setForm({
      ...emptyProduct,
      ...product,
      inventory_status: inferStatus(product),
      imagesText: toImagesText(product.images, product.image),
    });
  }

  function handleCancelEdit() {
    setForm(emptyProduct);
    setEditingId(null);
    setError('');
  }

  async function handleToggleAvailability(product) {
    const nextStatus = product.available !== false ? 'Agotado' : 'Disponible';
    try {
      await updateProduct(product.id, {
        available: product.available === false,
        inventory_status: nextStatus,
      });
      await loadProducts();
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la disponibilidad');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-gold">Productos</p>
        <h1 className="mt-2 text-3xl font-semibold">Administrar catálogo</h1>
      </div>
      {error ? <p className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p> : null}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-white/60">Información general</p>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={form.name || ''}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Nombre del producto"
              className="rounded-full border border-white/10 bg-black/40 px-4 py-3"
              required
            />

            <select
              value={form.category || ''}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              className="rounded-full border border-white/10 bg-black/40 px-4 py-3"
              required
            >
              <option value="">Categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>

            <select
              value={form.family || ''}
              onChange={(event) => setForm((current) => ({ ...current, family: event.target.value }))}
              className="rounded-full border border-white/10 bg-black/40 px-4 py-3"
              required
            >
              <option value="">Colección</option>
              {collectionOptions.map((collection) => (
                <option key={collection} value={collection}>{collection}</option>
              ))}
            </select>

            <select
              value={form.subcategory || ''}
              onChange={(event) => setForm((current) => ({ ...current, subcategory: event.target.value }))}
              className="rounded-full border border-white/10 bg-black/40 px-4 py-3"
              required
            >
              <option value="">Tipo de producto</option>
              {productTypeOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-white/60">Información comercial</p>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={form.price || 0}
              type="number"
              onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))}
              placeholder="Precio"
              className="rounded-full border border-white/10 bg-black/40 px-4 py-3"
              required
            />

            <select
              value={form.inventory_status || 'Disponible'}
              onChange={(event) => setForm((current) => ({ ...current, inventory_status: event.target.value }))}
              className="rounded-full border border-white/10 bg-black/40 px-4 py-3"
              required
            >
              {PRODUCT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-white/60">Especificaciones</p>
          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={form.bead_size || ''}
              onChange={(event) => setForm((current) => ({ ...current, bead_size: event.target.value }))}
              className="rounded-full border border-white/10 bg-black/40 px-4 py-3"
            >
              <option value="">Número del balín</option>
              {BALIN_OPTIONS.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-white/60">Contenido</p>
          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={form.description_template || ''}
              onChange={(event) => {
                const template = event.target.value;
                setForm((current) => ({
                  ...current,
                  description_template: template,
                  description: template ? generateDescriptionFromTemplate(template, current.name) : current.description,
                }));
              }}
              className="rounded-full border border-white/10 bg-black/40 px-4 py-3"
            >
              <option value="">Plantilla de descripción</option>
              {descriptionTemplateOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-white/70">Imágenes (una URL por línea o separadas por coma)</label>
            <textarea
              value={form.imagesText || ''}
              onChange={(event) => setForm({ ...form, imagesText: event.target.value, image: parseImagesText(event.target.value)[0] || '' })}
              placeholder="https://.../imagen-1.jpg&#10;https://.../imagen-2.jpg"
              className="min-h-[100px] w-full rounded-[1.5rem] border border-white/10 bg-black/40 px-4 py-3"
            />
          </div>

          <textarea
            value={form.description || ''}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="Descripción"
            className="min-h-[120px] w-full rounded-[1.5rem] border border-white/10 bg-black/40 px-4 py-3"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="rounded-full bg-gold px-4 py-3 font-semibold text-deep-black">{editingId ? 'Guardar cambios' : 'Crear producto'}</button>
          {editingId ? (
            <button type="button" onClick={handleCancelEdit} className="rounded-full border border-white/10 px-4 py-3 text-sm">Cancelar edición</button>
          ) : null}
        </div>
      </form>

      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">Listado de productos</h2>
        {loading ? <p className="mt-4 text-sm text-white/60">Cargando…</p> : null}
        <div className="mt-4 space-y-3">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-white/60">
                  {product.category || 'Sin categoría'} · Stock: {product.stock ?? 0} · Precio: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(product.price || 0))}
                </p>
                <p className="text-xs text-white/50">{product.reference || product.sku || product.id} · {product.inventory_status || (product.available !== false ? 'Disponible' : 'Agotado')} · Balín: {product.bead_size || 'N/A'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleToggleAvailability(product)} className="rounded-full border border-white/10 px-3 py-2 text-sm">
                  {product.available !== false ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => handleEdit(product)} className="rounded-full border border-white/10 px-3 py-2 text-sm">Editar</button>
                <button onClick={() => handleDelete(product.id)} className="rounded-full bg-red-500/80 px-3 py-2 text-sm">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

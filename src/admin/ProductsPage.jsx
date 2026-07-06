import React, { useEffect, useState } from 'react';
import { createProduct, deleteProduct, listCategories, listProducts, updateProduct } from './api.ts';

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
  imagesText: '',
};

function toSlug(value = '') {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

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
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      const payload = {
        ...form,
        slug: toSlug(form.slug || form.name),
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
      setSlugTouched(false);
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
      imagesText: toImagesText(product.images, product.image),
    });
    setSlugTouched(true);
  }

  function handleCancelEdit() {
    setForm(emptyProduct);
    setEditingId(null);
    setSlugTouched(false);
    setError('');
  }

  async function handleToggleAvailability(product) {
    try {
      await updateProduct(product.id, { available: !(product.available !== false) });
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
      <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={form.name || ''}
            onChange={(event) => {
              const name = event.target.value;
              setForm((current) => ({
                ...current,
                name,
                slug: slugTouched ? current.slug : toSlug(name),
              }));
            }}
            placeholder="Nombre"
            className="rounded-full border border-white/10 bg-black/40 px-4 py-3"
            required
          />
          <input
            value={form.slug || ''}
            onChange={(event) => {
              setSlugTouched(true);
              setForm({ ...form, slug: toSlug(event.target.value) });
            }}
            placeholder="Slug"
            className="rounded-full border border-white/10 bg-black/40 px-4 py-3"
            required
          />
          <input value={form.sku || ''} onChange={(event) => setForm({ ...form, sku: event.target.value })} placeholder="SKU" className="rounded-full border border-white/10 bg-black/40 px-4 py-3" />

          <select
            value={form.category || ''}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
            className="rounded-full border border-white/10 bg-black/40 px-4 py-3"
          >
            <option value="">Categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>

          <input value={form.subcategory || ''} onChange={(event) => setForm({ ...form, subcategory: event.target.value })} placeholder="Subcategoría" className="rounded-full border border-white/10 bg-black/40 px-4 py-3" />
          <input value={form.price || 0} type="number" onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} placeholder="Precio" className="rounded-full border border-white/10 bg-black/40 px-4 py-3" />
          <input value={form.stock || 0} type="number" onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })} placeholder="Stock" className="rounded-full border border-white/10 bg-black/40 px-4 py-3" />
          <input value={form.family || ''} onChange={(event) => setForm({ ...form, family: event.target.value })} placeholder="Familia" className="rounded-full border border-white/10 bg-black/40 px-4 py-3" />
          <input value={form.reference || ''} onChange={(event) => setForm({ ...form, reference: event.target.value })} placeholder="Referencia" className="rounded-full border border-white/10 bg-black/40 px-4 py-3" />
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

        <textarea value={form.description || ''} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Descripción" className="min-h-[120px] w-full rounded-[1.5rem] border border-white/10 bg-black/40 px-4 py-3" />
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={Boolean(form.available)} onChange={(event) => setForm({ ...form, available: event.target.checked })} /> Disponible</label>
          <label className="flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={Boolean(form.featured)} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> Destacado</label>
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
                <p className="text-xs text-white/50">{product.reference || product.sku || product.id} · {product.available !== false ? 'Activo en catálogo' : 'Oculto en catálogo'}</p>
              </div>
              <div className="flex gap-2">
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

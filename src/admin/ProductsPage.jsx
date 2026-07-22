import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createProduct, deleteProduct, listProducts, updateProduct } from './api.ts';
import {
  BALIN_OPTIONS,
  COLLECTION_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
  generateDescriptionFromTemplate,
  generateReference,
  generateSku,
  getDescriptionTemplateOptions,
  inferStatus,
  toAvailability,
  toSlug,
} from './productAutomation.js';
import ProductPhotoRolesUploader from './components/ProductPhotoRolesUploader.jsx';
import { useProductImagesUpload } from './hooks/useProductImagesUpload.js';
import ProductDetailView from '../components/ProductDetailView.jsx';
import {
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_MATERIAL_OPTIONS,
  PRODUCT_SUBCATEGORY_OPTIONS,
} from './constants/productMeta.js';

const emptyProduct = {
  name: '',
  slug: '',
  sku: '',
  category: '',
  subcategory: '',
  material: '',
  description: '',
  short_description: '',
  price: '',
  stock: 0,
  available: true,
  featured: false,
  family: '',
  reference: '',
  inventory_status: 'Disponible',
  bead_size: '',
  description_template: '',
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const submitLockRef = useRef(false);
  const {
    images,
    resetWithUrls,
    clearAll,
    finalizeForProduct,
    hasPendingUploads,
    hasUploadErrors,
    setImageAtSlot,
    removeImageAtSlot,
  } = useProductImagesUpload();

  const descriptionTemplateOptions = useMemo(() => getDescriptionTemplateOptions(), []);

  const collectionOptions = useMemo(() => {
    const knownCollections = products
      .map((product) => (product?.family || '').trim())
      .filter(Boolean);
    return Array.from(new Set([...COLLECTION_OPTIONS, ...knownCollections]));
  }, [products]);

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

  useEffect(() => {
    loadProducts();
  }, []);

  function handlePriceChange(event) {
    const digitsOnly = event.target.value.replace(/\D/g, '');
    setForm((current) => ({ ...current, price: digitsOnly }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    setIsSubmitting(true);
    try {
      const priceValue = Number(String(form.price || '').replace(/\D/g, ''));
      if (!priceValue || priceValue <= 0) {
        throw new Error('El precio debe ser mayor que cero');
      }

      if (!form.category) throw new Error('Selecciona una categoría');
      if (!form.subcategory) throw new Error('Selecciona una subcategoría');
      if (!form.material) throw new Error('Selecciona un material');

      const heroImage = images.find((item) => item?.slotIndex === 0) || images[0];
      const hasHero = Boolean(heroImage?.url || heroImage?.previewUrl);
      if (!hasHero) {
        throw new Error('Debes cargar la fotografía Hero Shot antes de guardar');
      }

      const slug = toSlug(form.name || form.slug || '');
      const imagePayload = await finalizeForProduct({
        category: form.category,
        productSlug: slug,
      });

      if (!imagePayload.images.length) {
        throw new Error('Debes cargar al menos una imagen del producto');
      }

      const reference = generateReference(products, form.category, editingId ? form.reference : '');
      const sku = generateSku(products, form.category, editingId ? form.sku : '');
      const inventoryStatus = form.inventory_status || 'Disponible';
      const payload = {
        ...form,
        price: priceValue,
        slug,
        reference,
        sku,
        inventory_status: inventoryStatus,
        available: toAvailability(inventoryStatus),
        images: imagePayload.images,
        image: imagePayload.image,
      };

      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      setForm(emptyProduct);
      setEditingId(null);
      await clearAll();
      await loadProducts();
    } catch (err) {
      setError(err.message || 'No se pudo guardar el producto');
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id) {
    const previous = products;
    setProducts((current) => current.filter((item) => item.id !== id));
    try {
      await deleteProduct(id);
      setError('');
    } catch (err) {
      setProducts(previous);
      setError(err.message || 'No se pudo eliminar el producto');
    }
  }

  function handleEdit(product) {
    setEditingId(product.id);
    const productImages = Array.isArray(product.images) && product.images.length
      ? product.images
      : (product.image ? [product.image] : []);

    setForm({
      ...emptyProduct,
      ...product,
      price: product?.price ? String(product.price) : '',
      inventory_status: inferStatus(product),
    });
    resetWithUrls(productImages);
  }

  function handleCancelEdit() {
    setForm(emptyProduct);
    setEditingId(null);
    setError('');
    void clearAll();
  }

  const previewProduct = useMemo(() => {
    const slottedImages = [...images]
      .sort((a, b) => {
        const left = Number.isFinite(a?.slotIndex) ? a.slotIndex : 1000;
        const right = Number.isFinite(b?.slotIndex) ? b.slotIndex : 1000;
        return left - right;
      })
      .map((item) => item.previewUrl || item.url)
      .filter(Boolean);
    return {
      id: editingId || 'preview',
      name: form.name || 'Producto SJ Joyeros',
      family: form.family || form.category || 'Coleccion',
      category: form.category || 'Categoria',
      subcategory: form.subcategory || 'Subcategoria',
      description: form.description || 'La descripcion del producto aparecera aqui para validar presentacion antes de publicar.',
      price: Number(String(form.price || '').replace(/\D/g, '')) || 0,
      stock: Number(form.stock || 0),
      inventory_status: form.inventory_status || 'Disponible',
      image: slottedImages[0] || '',
      images: slottedImages,
    };
  }, [editingId, form, images]);

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
        <p className="luxury-kicker">Productos</p>
        <h1 className="mt-2 font-display text-5xl leading-[0.95]">Administrar catalogo</h1>
      </div>
      {error ? <p className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p> : null}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.35)] sm:p-6">
        <section className="space-y-3 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-white/60">Información general</p>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={form.name || ''}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Nombre del producto"
              className="luxury-input px-4 py-3"
              required
            />

            <select
              value={form.category || ''}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              className="luxury-input px-4 py-3"
              required
            >
              <option value="">Categoría</option>
              {PRODUCT_CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={form.subcategory || ''}
              onChange={(event) => setForm((current) => ({ ...current, subcategory: event.target.value }))}
              className="luxury-input px-4 py-3"
              required
            >
              <option value="">Subcategoría</option>
              {PRODUCT_SUBCATEGORY_OPTIONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <select
              value={form.material || ''}
              onChange={(event) => setForm((current) => ({ ...current, material: event.target.value }))}
              className="luxury-input px-4 py-3"
              required
            >
              <option value="">Material</option>
              {PRODUCT_MATERIAL_OPTIONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            <select
              value={form.family || ''}
              onChange={(event) => setForm((current) => ({ ...current, family: event.target.value }))}
              className="luxury-input px-4 py-3"
            >
              <option value="">Colección (opcional)</option>
              {collectionOptions.map((collection) => (
                <option key={collection} value={collection}>{collection}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="space-y-3 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-white/60">Inventario y precio</p>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={form.price || ''}
              type="text"
              inputMode="numeric"
              onChange={handlePriceChange}
              placeholder="Ej: 35.000"
              className="luxury-input px-4 py-3"
              required
            />

            <select
              value={form.inventory_status || 'Disponible'}
              onChange={(event) => setForm((current) => ({ ...current, inventory_status: event.target.value }))}
              className="luxury-input px-4 py-3"
              required
            >
              {PRODUCT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <input
              value={form.stock ?? 0}
              type="number"
              min="0"
              onChange={(event) => setForm((current) => ({ ...current, stock: Math.max(0, Number(event.target.value || 0)) }))}
              placeholder="Stock"
              className="luxury-input px-4 py-3"
            />
          </div>
        </section>

        <section className="space-y-3 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-white/60">Especificaciones</p>
          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={form.bead_size || ''}
              onChange={(event) => setForm((current) => ({ ...current, bead_size: event.target.value }))}
              className="luxury-input px-4 py-3"
            >
              <option value="">Número del balín</option>
              {BALIN_OPTIONS.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="space-y-3 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-white/60">Descripción</p>
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
              className="luxury-input px-4 py-3"
            >
              <option value="">Plantilla de descripción</option>
              {descriptionTemplateOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

          <textarea
            value={form.description || ''}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="Descripción"
            className="min-h-[120px] w-full rounded-[1.2rem] border border-white/10 bg-black/40 px-4 py-3"
          />
        </section>

        <section className="space-y-3 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-white/60">Fotografías</p>
          <ProductPhotoRolesUploader
            images={images}
            onSetSlotFile={(file, slotIndex) => setImageAtSlot({ file, slotIndex })}
            onRemoveSlot={(slotIndex) => removeImageAtSlot(slotIndex)}
            hasPendingUploads={hasPendingUploads}
            hasUploadErrors={hasUploadErrors}
          />
        </section>

        <section className="space-y-3 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-white/60">Vista previa</p>
          <ProductDetailView
            product={previewProduct}
            relatedProducts={[]}
            whatsappUrl="#"
            mode="preview"
            className="rounded-[1.2rem] border border-white/10 bg-black/20 p-3"
          />
        </section>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={isSubmitting || hasPendingUploads} className="luxury-btn-primary px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60">{editingId ? 'Guardar cambios' : 'Crear producto'}</button>
          {editingId ? (
            <button type="button" onClick={handleCancelEdit} className="luxury-btn-secondary px-5 py-3 text-sm">Cancelar edicion</button>
          ) : null}
        </div>
      </form>

      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
        <h2 className="text-xl font-semibold">Listado de productos</h2>
        {loading ? <p className="mt-4 text-sm text-white/60">Cargando…</p> : null}
        <div className="mt-4 space-y-3">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-white/60">
                  {product.category || 'Sin categoría'} · {product.subcategory || 'Sin subcategoría'} · {product.material || 'Sin material'} · Stock: {product.stock ?? 0} · Precio: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(product.price || 0))}
                </p>
                <p className="text-xs text-white/50">{product.reference || product.sku || product.id} · {product.inventory_status || (product.available !== false ? 'Disponible' : 'Agotado')} · Balín: {product.bead_size || 'N/A'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleToggleAvailability(product)} className="luxury-btn-secondary px-3 py-2 text-sm">
                  {product.available !== false ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => handleEdit(product)} className="luxury-btn-secondary px-3 py-2 text-sm">Editar</button>
                <button onClick={() => handleDelete(product.id)} className="luxury-btn-danger px-3 py-2 text-sm">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

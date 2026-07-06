import React, { useEffect, useState } from 'react';
import { createCategory, deleteCategory, listCategories, updateCategory } from './api.ts';

const emptyCategory = { name: '', slug: '', description: '', image: '' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyCategory);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await listCategories();
      setCategories(data);
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las categorías');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      if (editingId) {
        await updateCategory(editingId, form);
      } else {
        await createCategory(form);
      }
      setForm(emptyCategory);
      setEditingId(null);
      await loadCategories();
    } catch (err) {
      setError(err.message || 'No se pudo guardar la categoría');
    }
  }

  async function handleDelete(id) {
    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la categoría');
    }
  }

  function handleEdit(category) {
    setEditingId(category.id);
    setForm(category);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-gold">Categorías</p>
        <h1 className="mt-2 text-3xl font-semibold">Organizar el inventario</h1>
      </div>
      {error ? <p className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</p> : null}
      <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <input value={form.name || ''} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nombre" className="rounded-full border border-white/10 bg-black/40 px-4 py-3" required />
          <input value={form.slug || ''} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="Slug" className="rounded-full border border-white/10 bg-black/40 px-4 py-3" required />
          <input value={form.image || ''} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="URL de imagen" className="rounded-full border border-white/10 bg-black/40 px-4 py-3" />
        </div>
        <textarea value={form.description || ''} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Descripción" className="min-h-[120px] w-full rounded-[1.5rem] border border-white/10 bg-black/40 px-4 py-3" />
        <button type="submit" className="rounded-full bg-gold px-4 py-3 font-semibold text-deep-black">{editingId ? 'Guardar cambios' : 'Crear categoría'}</button>
      </form>
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">Listado de categorías</h2>
        {loading ? <p className="mt-4 text-sm text-white/60">Cargando…</p> : null}
        <div className="mt-4 space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{category.name}</p>
                <p className="text-sm text-white/60">{category.slug}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleEdit(category)} className="rounded-full border border-white/10 px-3 py-2 text-sm">Editar</button>
                <button onClick={() => handleDelete(category.id)} className="rounded-full bg-red-500/80 px-3 py-2 text-sm">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

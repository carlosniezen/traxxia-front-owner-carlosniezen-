import React, { useEffect, useState } from 'react';
import { admin } from '../api.js';
import { useStore } from '../App.jsx';
import { money, toCents, fromCents } from '../lib.jsx';

const blank = { name: '', category_id: '', price: '', compare_at_price: '', stock: '', sku: '', description: '', image_url: '', active: true, featured: false };

export default function Products() {
  const { store, reload } = useStore();
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null); // product object or blank; null = closed

  const load = () => admin.products().then(setProducts);
  useEffect(() => { load(); admin.categories().then(setCategories); }, []);

  const remove = async (p) => {
    if (!confirm(`¿Eliminar "${p.name}"?`)) return;
    await admin.deleteProduct(p.id);
    load();
  };

  return (
    <div>
      <div className="page-head">
        <h1>Productos</h1>
        <button className="btn-primary" onClick={() => setEditing({ ...blank })}>+ Nuevo producto</button>
      </div>

      {products === null ? <p className="muted">Cargando…</p> : (
        <table className="table">
          <thead><tr><th></th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="cell-img">{p.image_url ? <img src={p.image_url} alt="" /> : '📦'}</td>
                <td><strong>{p.name}</strong>{p.featured ? <span className="tag">Destacado</span> : null}</td>
                <td>{p.category_name || '—'}</td>
                <td>{money(p.price, store.currency_symbol)}</td>
                <td className={p.stock <= 5 ? 'low' : ''}>{p.stock}</td>
                <td><span className={p.active ? 'pill s-paid' : 'pill s-cancelled'}>{p.active ? 'Activo' : 'Oculto'}</span></td>
                <td className="cell-actions">
                  <button className="link" onClick={() => setEditing(p)}>Editar</button>
                  <button className="link-danger" onClick={() => remove(p)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && (
        <ProductModal
          product={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); reload(); }}
        />
      )}
    </div>
  );
}

function ProductModal({ product, categories, onClose, onSaved }) {
  const isNew = !product.id;
  const [form, setForm] = useState({
    ...product,
    price: product.price != null && product.price !== '' ? fromCents(product.price) : '',
    compare_at_price: product.compare_at_price ? fromCents(product.compare_at_price) : '',
    active: product.active !== 0 && product.active !== false,
    featured: !!product.featured,
  });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const payload = {
      name: form.name,
      category_id: form.category_id ? Number(form.category_id) : null,
      price: toCents(form.price),
      compare_at_price: form.compare_at_price ? toCents(form.compare_at_price) : null,
      stock: parseInt(form.stock, 10) || 0,
      sku: form.sku || null,
      description: form.description || null,
      image_url: form.image_url || null,
      active: form.active,
      featured: form.featured,
    };
    try {
      if (isNew) await admin.createProduct(payload);
      else await admin.updateProduct(product.id, payload);
      onSaved();
    } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <h2>{isNew ? 'Nuevo producto' : 'Editar producto'}</h2>
        <label>Nombre *<input required value={form.name} onChange={set('name')} /></label>
        <div className="field-row">
          <label>Categoría
            <select value={form.category_id || ''} onChange={set('category_id')}>
              <option value="">Sin categoría</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label>SKU<input value={form.sku || ''} onChange={set('sku')} /></label>
        </div>
        <div className="field-row">
          <label>Precio (S/) *<input type="number" step="0.01" min="0" required value={form.price} onChange={set('price')} /></label>
          <label>Precio antes (S/)<input type="number" step="0.01" min="0" value={form.compare_at_price} onChange={set('compare_at_price')} /></label>
          <label>Stock<input type="number" min="0" value={form.stock} onChange={set('stock')} /></label>
        </div>
        <label>Descripción<textarea rows="3" value={form.description || ''} onChange={set('description')} /></label>
        <label>URL de imagen<input value={form.image_url || ''} onChange={set('image_url')} placeholder="https://…" /></label>
        <div className="field-row checks">
          <label className="check"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Visible en la tienda</label>
          <label className="check"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Destacado</label>
        </div>
        {error && <p className="coupon-err">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
}

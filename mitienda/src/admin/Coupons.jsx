import React, { useEffect, useState } from 'react';
import { admin } from '../api.js';
import { useStore } from '../App.jsx';
import { money, toCents, fromCents } from '../lib.jsx';

const blank = { code: '', type: 'percent', value: '', min_subtotal: '', active: true };

export default function Coupons() {
  const { store } = useStore();
  const [coupons, setCoupons] = useState(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState(null);
  const sym = store.currency_symbol;

  const load = () => admin.coupons().then(setCoupons);
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await admin.createCoupon({
        code: form.code,
        type: form.type,
        value: form.type === 'percent' ? (parseInt(form.value, 10) || 0) : toCents(form.value),
        min_subtotal: form.min_subtotal ? toCents(form.min_subtotal) : 0,
        active: true,
      });
      setForm(blank);
      load();
    } catch (err) { setError(err.message); }
  };

  const remove = async (c) => { if (confirm(`¿Eliminar cupón ${c.code}?`)) { await admin.deleteCoupon(c.id); load(); } };

  const describe = (c) => c.type === 'percent' ? `${c.value}% de descuento` : `${money(c.value, sym)} de descuento`;

  return (
    <div>
      <h1>Cupones</h1>
      <div className="cols">
        <div className="panel">
          <h2>Cupones activos</h2>
          {coupons === null ? <p className="muted">Cargando…</p> : coupons.length === 0 ? <p className="muted">Sin cupones.</p> : (
            <table className="table">
              <thead><tr><th>Código</th><th>Descuento</th><th>Mínimo</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.code}</strong></td>
                    <td>{describe(c)}</td>
                    <td>{c.min_subtotal ? money(c.min_subtotal, sym) : '—'}</td>
                    <td><span className={c.active ? 'pill s-paid' : 'pill s-cancelled'}>{c.active ? 'Activo' : 'Inactivo'}</span></td>
                    <td><button className="link-danger" onClick={() => remove(c)}>Eliminar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <form className="panel form-panel" onSubmit={create}>
          <h2>Nuevo cupón</h2>
          <label>Código<input value={form.code} onChange={set('code')} placeholder="EJ: VERANO20" required /></label>
          <label>Tipo
            <select value={form.type} onChange={set('type')}>
              <option value="percent">Porcentaje (%)</option>
              <option value="fixed">Monto fijo (S/)</option>
            </select>
          </label>
          <label>{form.type === 'percent' ? 'Porcentaje' : 'Monto (S/)'}
            <input type="number" step={form.type === 'percent' ? '1' : '0.01'} min="0" value={form.value} onChange={set('value')} required />
          </label>
          <label>Compra mínima (S/, opcional)<input type="number" step="0.01" min="0" value={form.min_subtotal} onChange={set('min_subtotal')} /></label>
          {error && <p className="coupon-err">{error}</p>}
          <button className="btn-primary full">Crear cupón</button>
        </form>
      </div>
    </div>
  );
}

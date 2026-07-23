import React, { useState } from 'react';
import { admin } from '../api.js';
import { useStore } from '../App.jsx';

export default function Settings() {
  const { store, reload } = useStore();
  const [form, setForm] = useState({ ...store });
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setSaved(false);
    try {
      await admin.updateStore(form);
      await reload();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setBusy(false); }
  };

  return (
    <div>
      <h1>Configuración de la tienda</h1>
      <form className="panel form-panel wide" onSubmit={save}>
        <label>Nombre de la tienda<input value={form.name || ''} onChange={set('name')} /></label>
        <label>Eslogan<input value={form.tagline || ''} onChange={set('tagline')} /></label>
        <label>Descripción<textarea rows="2" value={form.description || ''} onChange={set('description')} /></label>
        <label>URL del logo<input value={form.logo_url || ''} onChange={set('logo_url')} placeholder="https://…" /></label>

        <div className="field-row">
          <label>Color principal
            <span className="color-field"><input type="color" value={form.primary_color || '#2563eb'} onChange={set('primary_color')} /><input value={form.primary_color || ''} onChange={set('primary_color')} /></span>
          </label>
          <label>Color de acento
            <span className="color-field"><input type="color" value={form.accent_color || '#f59e0b'} onChange={set('accent_color')} /><input value={form.accent_color || ''} onChange={set('accent_color')} /></span>
          </label>
        </div>

        <div className="field-row">
          <label>Símbolo de moneda<input value={form.currency_symbol || ''} onChange={set('currency_symbol')} /></label>
          <label>Código de moneda<input value={form.currency || ''} onChange={set('currency')} /></label>
        </div>

        <h3>Contacto</h3>
        <div className="field-row">
          <label>WhatsApp<input value={form.whatsapp || ''} onChange={set('whatsapp')} /></label>
          <label>Correo<input value={form.email || ''} onChange={set('email')} /></label>
        </div>
        <label>Dirección<input value={form.address || ''} onChange={set('address')} /></label>

        <div className="modal-actions">
          {saved && <span className="coupon-ok">✔ Cambios guardados</span>}
          <button className="btn-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar cambios'}</button>
        </div>
      </form>
    </div>
  );
}

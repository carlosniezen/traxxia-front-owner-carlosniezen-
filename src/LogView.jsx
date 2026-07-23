import React, { useState } from 'react';
import { logDrink } from './api.js';

// Spec §4.2 — max 2 taps + confirm. Tap a category → quick sheet → confirm.
const SERVINGS = [
  { key: 'copa', label: 'Copa' },
  { key: 'trago', label: 'Trago' },
  { key: 'lata', label: 'Lata' },
  { key: 'botella', label: 'Botella' },
];

function QuickSheet({ category, onClose, onSaved }) {
  const [quantity, setQuantity] = useState(1);
  const [serving, setServing] = useState(category.is_nolo ? 'copa' : 'copa');
  const [withFood, setWithFood] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await logDrink({
        category_key: category.key,
        quantity,
        serving_type: serving,
        with_food: withFood,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <span className="big-icon">{category.icon}</span>
          <div>
            <strong>{category.name}</strong>
            <div className="muted small">{category.tags}</div>
          </div>
        </div>

        <label className="field">Cantidad
          <div className="stepper">
            <button onClick={() => setQuantity((q) => Math.max(0.5, q - 0.5))}>−</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 0.5)}>+</button>
          </div>
        </label>

        <div className="seg">
          {SERVINGS.map((s) => (
            <button key={s.key} className={serving === s.key ? 'on' : ''}
              onClick={() => setServing(s.key)}>{s.label}</button>
          ))}
        </div>

        {!category.is_nolo && (
          <div className="seg">
            <button className={withFood === true ? 'on' : ''} onClick={() => setWithFood(true)}>🍽️ Con comida</button>
            <button className={withFood === false ? 'on' : ''} onClick={() => setWithFood(false)}>🚫 Sin comida</button>
          </div>
        )}

        <div className="row-actions end">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={save} disabled={saving}>
            {saving ? 'Guardando…' : 'Registrar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LogView({ categories, onLogged }) {
  const [active, setActive] = useState(null);
  const [toast, setToast] = useState(null);

  const handleSaved = () => {
    setToast(`Registrado: ${active.name}`);
    setActive(null);
    onLogged?.();
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <section className="view">
      <h2 className="view-title">¿Qué tomaste?</h2>
      <p className="view-sub">Un toque para registrar. Mañana te preguntamos cómo te cayó.</p>
      <div className="cat-grid">
        {categories.map((c) => (
          <button key={c.key} className={'cat-tile' + (c.is_nolo ? ' nolo' : '')}
            onClick={() => setActive(c)}>
            <span className="cat-icon">{c.icon}</span>
            <span className="cat-name">{c.name}</span>
          </button>
        ))}
      </div>
      {active && <QuickSheet category={active} onClose={() => setActive(null)} onSaved={handleSaved} />}
      {toast && <div className="toast">✓ {toast}</div>}
    </section>
  );
}

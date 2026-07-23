import React, { useState } from 'react';
import { submitCheckin } from './api.js';

// Spec §4.3 — 4 sliders (1–5) + optional congestion. ≤15s of friction.
const SLIDERS = [
  { key: 'head', label: 'Cabeza', icon: '🧠', lo: 'Fatal', hi: 'Perfecta' },
  { key: 'stomach', label: 'Estómago', icon: '🫃', lo: 'Revuelto', hi: 'Genial' },
  { key: 'sleep', label: 'Sueño', icon: '😴', lo: 'Pésimo', hi: 'Reparador' },
  { key: 'energy', label: 'Energía', icon: '⚡', lo: 'En el piso', hi: 'A tope' },
];

export default function CheckinView({ pending, onDone }) {
  const [vals, setVals] = useState({ head: 3, stomach: 3, sleep: 3, energy: 3 });
  const [congestion, setCongestion] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!pending || pending.length === 0) {
    return (
      <section className="view">
        <div className="empty">
          <span className="big-icon">☀️</span>
          <h2>Sin check-ins pendientes</h2>
          <p className="view-sub">Cuando registres algo, a la mañana siguiente te preguntamos cómo amaneciste.</p>
        </div>
      </section>
    );
  }

  const set = (k, v) => setVals((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await submitCheckin({ ...vals, congestion: congestion ? 1 : 0, log_ids: pending.map((l) => l.id) });
      onDone?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="view">
      <h2 className="view-title">¿Cómo amaneciste?</h2>
      <p className="view-sub">
        Anoche: {pending.map((l) => `${l.icon} ${l.name}`).join(', ')}. Toma 15 segundos.
      </p>

      <div className="sliders">
        {SLIDERS.map((s) => (
          <div className="slider-row" key={s.key}>
            <div className="slider-label"><span>{s.icon}</span> {s.label}</div>
            <input type="range" min="1" max="5" value={vals[s.key]}
              onChange={(e) => set(s.key, Number(e.target.value))} />
            <div className="slider-scale"><span>{s.lo}</span><b>{vals[s.key]}</b><span>{s.hi}</span></div>
          </div>
        ))}
      </div>

      <button className={'toggle-pill' + (congestion ? ' on' : '')} onClick={() => setCongestion((c) => !c)}>
        {congestion ? '✓ ' : ''}🥵 Congestión / flushing
      </button>

      <div className="row-actions end">
        <button className="btn primary lg" onClick={save} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar check-in'}
        </button>
      </div>
    </section>
  );
}

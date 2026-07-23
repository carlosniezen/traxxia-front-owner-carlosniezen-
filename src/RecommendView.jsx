import React, { useState } from 'react';
import { getRecommendation } from './api.js';

// Spec §4.5 — ocasión + qué hay disponible → recomendación con cantidad moderada,
// qué evitar y por qué, una alternativa NoLo concreta y tips de mitigación.
const OCCASIONS = [
  { key: 'cena', label: 'Cena', icon: '🍽️' },
  { key: 'fiesta', label: 'Fiesta', icon: '🎉' },
  { key: 'after_office', label: 'After office', icon: '🍻' },
  { key: 'casa', label: 'En casa', icon: '🏠' },
];

export default function RecommendView({ categories }) {
  const [occasion, setOccasion] = useState('cena');
  const [available, setAvailable] = useState([]);
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggle = (k) =>
    setAvailable((a) => (a.includes(k) ? a.filter((x) => x !== k) : [...a, k]));

  const ask = async () => {
    setLoading(true);
    try {
      setRec(await getRecommendation({ occasion, available }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="view">
      <h2 className="view-title">¿Qué tomo hoy?</h2>
      <p className="view-sub">Elige la ocasión y (opcional) qué hay disponible.</p>

      <div className="seg wrap">
        {OCCASIONS.map((o) => (
          <button key={o.key} className={occasion === o.key ? 'on' : ''} onClick={() => setOccasion(o.key)}>
            {o.icon} {o.label}
          </button>
        ))}
      </div>

      <p className="view-sub mt">¿Qué hay disponible? (opcional)</p>
      <div className="mini-chips">
        {categories.filter((c) => !c.is_nolo).map((c) => (
          <button key={c.key} className={'mini-chip' + (available.includes(c.key) ? ' sel' : '')}
            onClick={() => toggle(c.key)}>{c.icon} {c.name}</button>
        ))}
      </div>

      <div className="row-actions">
        <button className="btn primary lg" onClick={ask} disabled={loading}>
          {loading ? 'Pensando…' : 'Recomiéndame'}
        </button>
      </div>

      {rec && (
        <div className="rec-result">
          {rec.free_night ? (
            <div className="rec-card best free">
              <div className="rec-tag">Sugerencia</div>
              <h3>🌙 ¿Y si hoy es noche libre?</h3>
              <p>{rec.pick?.suggested?.text}</p>
            </div>
          ) : rec.pick && (
            <div className="rec-card best">
              <div className="rec-tag">Te caería mejor</div>
              <h3>{rec.pick.icon} {rec.pick.name} <span className="score-pill">{rec.pick.score}/10</span></h3>
              <p>{rec.pick.why}</p>
              <p className="suggest">👉 {rec.pick.suggested.text}</p>
            </div>
          )}

          {rec.avoid && (
            <div className="rec-card avoid">
              <div className="rec-tag">Mejor evita</div>
              <h3>{rec.avoid.icon} {rec.avoid.name} <span className="score-pill low">{rec.avoid.score}/10</span></h3>
              <p>{rec.avoid.why}</p>
            </div>
          )}

          <div className="rec-card nolo">
            <div className="rec-tag">Alternativa sin alcohol</div>
            <h3>🧉 {rec.nolo_alternative}</h3>
          </div>

          <div className="rec-card tips">
            <div className="rec-tag">Para amanecer bien</div>
            <ul>{rec.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
        </div>
      )}
    </section>
  );
}

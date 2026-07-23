import React, { useState } from 'react';
import { saveProfile } from './api.js';

// Spec §4.1 — max 3 screens. Note the explicit "not a treatment app" disclaimer.
const SENSITIVITIES = [
  { key: 'hangover_headache', label: 'Cruda / dolor de cabeza', icon: '🤕' },
  { key: 'stomach_acidity', label: 'Estómago irritado / acidez', icon: '🔥' },
  { key: 'congestion_flushing', label: 'Congestión nasal / flushing', icon: '🥵' },
  { key: 'poor_sleep', label: 'Mal sueño', icon: '😴' },
  { key: 'low_energy', label: 'Energía baja al día siguiente', icon: '🔋' },
];

const GOALS = [
  { key: 'feel_better', label: 'Sentirme mejor cuando tomo', icon: '✨' },
  { key: 'drink_less', label: 'Tomar menos', icon: '📉' },
  { key: 'explore_nolo', label: 'Explorar opciones sin alcohol', icon: '🧉' },
];

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [sensitivities, setSensitivities] = useState([]);
  const [goal, setGoal] = useState('feel_better');
  const [weeklyGoal, setWeeklyGoal] = useState(7);
  const [saving, setSaving] = useState(false);

  const toggleSens = (k) =>
    setSensitivities((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  const finish = async () => {
    setSaving(true);
    try {
      await saveProfile({ sensitivities, goal, weekly_goal: weeklyGoal, onboarded: 1 });
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="onboarding">
      <div className="onb-card">
        <div className="onb-progress">
          {[0, 1, 2].map((i) => (
            <span key={i} className={'dot' + (i <= step ? ' on' : '')} />
          ))}
        </div>

        {step === 0 && (
          <>
            <h2>¿Qué te preocupa cuando tomas?</h2>
            <p className="onb-sub">Elige todo lo que aplique. Aprenderemos qué te cae mal a <em>ti</em>.</p>
            <div className="chip-grid">
              {SENSITIVITIES.map((s) => (
                <button
                  key={s.key}
                  className={'select-chip' + (sensitivities.includes(s.key) ? ' sel' : '')}
                  onClick={() => toggleSens(s.key)}
                >
                  <span className="ci">{s.icon}</span> {s.label}
                </button>
              ))}
            </div>
            <div className="onb-actions">
              <button className="btn primary" onClick={() => setStep(1)}>Continuar</button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2>¿Cuál es tu objetivo?</h2>
            <p className="onb-sub">Esto orienta las recomendaciones. Puedes cambiarlo luego.</p>
            <div className="chip-grid">
              {GOALS.map((g) => (
                <button
                  key={g.key}
                  className={'select-chip' + (goal === g.key ? ' sel' : '')}
                  onClick={() => setGoal(g.key)}
                >
                  <span className="ci">{g.icon}</span> {g.label}
                </button>
              ))}
            </div>
            <div className="onb-actions">
              <button className="btn" onClick={() => setStep(0)}>Atrás</button>
              <button className="btn primary" onClick={() => setStep(2)}>Continuar</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Meta semanal (opcional)</h2>
            <p className="onb-sub">
              En unidades estándar. Sugerimos 7. Es un norte, no un castigo.
            </p>
            <div className="goal-picker">
              <input
                type="range" min="1" max="14" value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(Number(e.target.value))}
              />
              <div className="goal-value">{weeklyGoal} <span>unidades / semana</span></div>
            </div>
            <p className="disclaimer">
              BienTomado te ayuda a tomar <strong>menos y mejor</strong>. No es una app de
              tratamiento de adicciones; si buscas ayuda clínica, acude a un profesional de salud.
            </p>
            <div className="onb-actions">
              <button className="btn" onClick={() => setStep(1)}>Atrás</button>
              <button className="btn primary" onClick={finish} disabled={saving}>
                {saving ? 'Guardando…' : 'Empezar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

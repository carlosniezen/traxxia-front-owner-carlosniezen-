import React, { useEffect, useState } from 'react';
import {
  getAgendaItems, createAgendaItem, updateAgendaItem, deleteAgendaItem,
} from './api.js';

const today = () => new Date().toISOString().slice(0, 10);

const shiftDate = (date, days) => {
  const d = new Date(date + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const prettyDate = (date) =>
  new Date(date + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  });

const minutesOf = (item) => {
  if (!item.start_time || !item.end_time) return 0;
  const [sh, sm] = item.start_time.split(':').map(Number);
  const [eh, em] = item.end_time.split(':').map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
};

const fmtMinutes = (m) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}` : `${m}m`);

// Distinct hues for the 9 pillar letters (S T R A T E G I C by position)
const PILLAR_COLORS = ['#0b3d91', '#2f6fdb', '#0e7d6e', '#7a3fa4', '#b0578d',
  '#c26a1f', '#6b7f1c', '#28808f', '#8a4d3a'];

function TimeByPillar({ items, pillars }) {
  const byPillar = new Map();
  let untagged = 0;
  for (const item of items) {
    const mins = minutesOf(item);
    if (!mins) continue;
    if (item.pillar_id) byPillar.set(item.pillar_id, (byPillar.get(item.pillar_id) ?? 0) + mins);
    else untagged += mins;
  }
  const total = [...byPillar.values()].reduce((a, b) => a + b, 0) + untagged;
  if (!total) return null;

  const segments = pillars
    .map((p, idx) => ({ pillar: p, color: PILLAR_COLORS[idx % PILLAR_COLORS.length], mins: byPillar.get(p.id) ?? 0 }))
    .filter((s) => s.mins > 0);

  return (
    <div className="time-bar-wrap">
      <div className="time-bar-title">Where your time goes ({fmtMinutes(total)} scheduled)</div>
      <div className="time-bar">
        {segments.map((s) => (
          <div key={s.pillar.id} className="time-seg" title={`${s.pillar.name}: ${fmtMinutes(s.mins)}`}
            style={{ width: `${(s.mins / total) * 100}%`, background: s.color }} />
        ))}
        {untagged > 0 && (
          <div className="time-seg untagged" title={`Not tied to a pillar: ${fmtMinutes(untagged)}`}
            style={{ width: `${(untagged / total) * 100}%` }} />
        )}
      </div>
      <div className="time-legend">
        {segments.map((s) => (
          <span key={s.pillar.id} className="legend-item">
            <span className="dot" style={{ background: s.color }} />
            {s.pillar.letter} {s.pillar.name} · {fmtMinutes(s.mins)}
          </span>
        ))}
        {untagged > 0 && (
          <span className="legend-item">
            <span className="dot untagged-dot" />
            No pillar · {fmtMinutes(untagged)}
          </span>
        )}
      </div>
    </div>
  );
}

const EMPTY = { title: '', start_time: '', end_time: '', pillar_id: '', notes: '' };

function ItemForm({ pillars, initial, onClose, onSaved }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial, pillar_id: initial.pillar_id ?? '' });
  const [error, setError] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        date: form.date,
        title: form.title,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        pillar_id: form.pillar_id ? Number(form.pillar_id) : null,
        notes: form.notes || null,
      };
      if (form.id) await updateAgendaItem(form.id, payload);
      else await createAgendaItem(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <h3>{form.id ? 'Edit agenda item' : 'New agenda item'}</h3>
        {error && <p className="error">{error}</p>}
        <label>Title
          <input value={form.title} onChange={set('title')} required autoFocus
            placeholder="Meeting, focus block, decision…" />
        </label>
        <div className="grid-2">
          <label>Start
            <input type="time" value={form.start_time ?? ''} onChange={set('start_time')} />
          </label>
          <label>End
            <input type="time" value={form.end_time ?? ''} onChange={set('end_time')} />
          </label>
        </div>
        <label>STRATEGIC pillar this serves
          <select value={form.pillar_id} onChange={set('pillar_id')}>
            <option value="">— none / not strategic —</option>
            {pillars.map((p) => (
              <option key={p.id} value={p.id}>{p.letter} — {p.name}</option>
            ))}
          </select>
        </label>
        <label>Notes
          <textarea rows={2} value={form.notes ?? ''} onChange={set('notes')} />
        </label>
        <div className="row-actions end">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary">{form.id ? 'Save changes' : 'Add to agenda'}</button>
        </div>
      </form>
    </div>
  );
}

export default function AgendaView({ pillars }) {
  const [date, setDate] = useState(today());
  const [items, setItems] = useState([]);
  const [formState, setFormState] = useState(null);

  const refresh = () => getAgendaItems(date).then(setItems).catch(() => setItems([]));
  useEffect(() => { refresh(); }, [date]);

  const pillarOf = (id) => pillars.find((p) => p.id === id);
  const pillarIdx = (id) => pillars.findIndex((p) => p.id === id);

  const toggleDone = async (item) => {
    await updateAgendaItem(item.id, { done: item.done ? 0 : 1 });
    refresh();
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    await deleteAgendaItem(item.id);
    refresh();
  };

  return (
    <div className="agenda-view">
      <div className="agenda-toolbar">
        <div className="date-nav">
          <button className="btn sm" onClick={() => setDate(shiftDate(date, -1))}>‹</button>
          <button className="btn sm" onClick={() => setDate(today())}>Today</button>
          <button className="btn sm" onClick={() => setDate(shiftDate(date, 1))}>›</button>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <h2 className="agenda-date">{prettyDate(date)}</h2>
        <button className="btn primary" onClick={() => setFormState({ date })}>+ Add item</button>
      </div>

      <TimeByPillar items={items} pillars={pillars} />

      <div className="agenda-list">
        {items.length === 0 && (
          <p className="empty">Nothing scheduled. Add your first item — and tag it to the pillar it serves.</p>
        )}
        {items.map((item) => {
          const pillar = pillarOf(item.pillar_id);
          const color = pillar ? PILLAR_COLORS[pillarIdx(item.pillar_id) % PILLAR_COLORS.length] : '#b6bec9';
          return (
            <div key={item.id} className={'agenda-item' + (item.done ? ' done' : '')}
              style={{ borderLeftColor: color }}>
              <input type="checkbox" checked={!!item.done} onChange={() => toggleDone(item)}
                title="Mark done" />
              <span className="agenda-time">
                {item.start_time ? item.start_time + (item.end_time ? `–${item.end_time}` : '') : '—'}
              </span>
              <span className="agenda-title">{item.title}</span>
              {pillar
                ? <span className="pillar-tag" style={{ background: color }} title={pillar.description}>
                    {pillar.letter} · {pillar.name}
                  </span>
                : <span className="pillar-tag none">no pillar</span>}
              <span className="card-actions">
                <button className="icon-btn" title="Edit" onClick={() => setFormState(item)}>✎</button>
                <button className="icon-btn danger" title="Delete" onClick={() => remove(item)}>✕</button>
              </span>
            </div>
          );
        })}
      </div>

      {formState && (
        <ItemForm pillars={pillars} initial={formState}
          onClose={() => setFormState(null)} onSaved={refresh} />
      )}
    </div>
  );
}

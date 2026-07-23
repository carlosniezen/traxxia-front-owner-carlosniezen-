import React, { useEffect, useState } from 'react';
import {
  getAgenda, updatePillar, createInitiative, updateInitiative, deleteInitiative,
} from './api.js';

const STATUSES = ['Idea', 'Planned', 'In Progress', 'At Risk', 'Done'];

const statusClass = (s) => 'chip status-' + s.toLowerCase().replace(/\s+/g, '-');

function SummaryBar({ pillars }) {
  const all = pillars.flatMap((p) => p.initiatives);
  const counts = STATUSES.map((s) => [s, all.filter((i) => i.status === s).length]);
  return (
    <div className="summary">
      <div className="summary-item">
        <span className="summary-num">{all.length}</span>
        <span className="summary-label">Strategic bets</span>
      </div>
      {counts.map(([s, n]) => (
        <div className="summary-item" key={s}>
          <span className="summary-num">{n}</span>
          <span className={statusClass(s)}>{s}</span>
        </div>
      ))}
    </div>
  );
}

function PillarHeader({ pillar, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(pillar.name);
  const [description, setDescription] = useState(pillar.description ?? '');

  const save = async () => {
    await updatePillar(pillar.id, { name, description });
    setEditing(false);
    onSaved();
  };

  if (editing) {
    return (
      <div className="pillar-header editing">
        <span className="pillar-letter">{pillar.letter}</span>
        <div className="pillar-edit-fields">
          <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Pillar name" />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            aria-label="Pillar description"
          />
          <div className="row-actions">
            <button className="btn primary sm" onClick={save}>Save</button>
            <button className="btn sm" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pillar-header">
      <span className="pillar-letter">{pillar.letter}</span>
      <div className="pillar-title-block">
        <h2>
          {pillar.name}
          <button className="icon-btn" title="Edit pillar wording" onClick={() => setEditing(true)}>✎</button>
        </h2>
        {pillar.description && <p className="pillar-desc">{pillar.description}</p>}
      </div>
    </div>
  );
}

function InitiativeCard({ initiative, onEdit, onDelete, onStatus }) {
  return (
    <div className="card">
      <div className="card-top">
        <strong>{initiative.title}</strong>
        <div className="card-actions">
          <button className="icon-btn" title="Edit" onClick={onEdit}>✎</button>
          <button className="icon-btn danger" title="Delete" onClick={onDelete}>✕</button>
        </div>
      </div>
      {initiative.hypothesis && (
        <p className="card-line"><span className="k">Hypothesis</span> {initiative.hypothesis}</p>
      )}
      {initiative.expected_result && (
        <p className="card-line"><span className="k">Expected result</span> {initiative.expected_result}</p>
      )}
      <div className="card-meta">
        <select
          className={statusClass(initiative.status)}
          value={initiative.status}
          onChange={(e) => onStatus(e.target.value)}
          aria-label="Status"
        >
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        {initiative.owner && <span className="meta">👤 {initiative.owner}</span>}
        {initiative.due_date && <span className="meta">📅 {initiative.due_date}</span>}
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  title: '', owner: '', status: 'Idea', hypothesis: '',
  expected_result: '', due_date: '', notes: '',
};

function InitiativeForm({ pillars, initial, onClose, onSaved }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const [error, setError] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        pillar_id: Number(form.pillar_id),
        owner: form.owner || null,
        hypothesis: form.hypothesis || null,
        expected_result: form.expected_result || null,
        due_date: form.due_date || null,
        notes: form.notes || null,
      };
      if (form.id) await updateInitiative(form.id, payload);
      else await createInitiative(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <h3>{form.id ? 'Edit strategic bet' : 'New strategic bet'}</h3>
        {error && <p className="error">{error}</p>}
        <label>Title
          <input value={form.title} onChange={set('title')} required autoFocus />
        </label>
        <div className="grid-2">
          <label>Pillar
            <select value={form.pillar_id} onChange={set('pillar_id')}>
              {pillars.map((p) => (
                <option key={p.id} value={p.id}>{p.letter} — {p.name}</option>
              ))}
            </select>
          </label>
          <label>Status
            <select value={form.status} onChange={set('status')}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label>Owner
            <input value={form.owner ?? ''} onChange={set('owner')} placeholder="Who is accountable?" />
          </label>
          <label>Due date
            <input type="date" value={form.due_date ?? ''} onChange={set('due_date')} />
          </label>
        </div>
        <label>Hypothesis
          <textarea rows={2} value={form.hypothesis ?? ''} onChange={set('hypothesis')}
            placeholder="What do we believe will happen if this bet succeeds?" />
        </label>
        <label>Expected result
          <textarea rows={2} value={form.expected_result ?? ''} onChange={set('expected_result')}
            placeholder="How will we know it worked?" />
        </label>
        <label>Notes
          <textarea rows={2} value={form.notes ?? ''} onChange={set('notes')} />
        </label>
        <div className="row-actions end">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary">{form.id ? 'Save changes' : 'Add bet'}</button>
        </div>
      </form>
    </div>
  );
}

export default function App() {
  const [pillars, setPillars] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [formState, setFormState] = useState(null); // {pillar_id, ...initiative?}

  const refresh = () =>
    getAgenda().then((d) => { setPillars(d); setLoadError(null); })
      .catch((e) => setLoadError(e.message));

  useEffect(() => { refresh(); }, []);

  const setStatus = async (initiative, status) => {
    await updateInitiative(initiative.id, { status });
    refresh();
  };

  const remove = async (initiative) => {
    if (!window.confirm(`Delete "${initiative.title}"?`)) return;
    await deleteInitiative(initiative.id);
    refresh();
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Traxxia <span className="thin">| Strategic Agenda</span></h1>
          <p className="tagline">
            Your priorities as strategic bets, organized by the S.T.R.A.T.E.G.I.C. pillars.
            Pillar wording is editable (✎) — align it with your model.
          </p>
        </div>
      </header>

      {loadError && (
        <div className="banner error">
          Could not reach the Traxxia API ({loadError}). Start it with <code>npm start</code> in
          <code> traxxia-api</code> (http://localhost:4000).
        </div>
      )}

      {pillars && <SummaryBar pillars={pillars} />}

      <main className="board">
        {pillars?.map((pillar) => (
          <section className="pillar" key={pillar.id}>
            <PillarHeader pillar={pillar} onSaved={refresh} />
            <div className="cards">
              {pillar.initiatives.map((i) => (
                <InitiativeCard
                  key={i.id}
                  initiative={i}
                  onEdit={() => setFormState(i)}
                  onDelete={() => remove(i)}
                  onStatus={(s) => setStatus(i, s)}
                />
              ))}
              <button className="btn add" onClick={() => setFormState({ pillar_id: pillar.id })}>
                + Add strategic bet
              </button>
            </div>
          </section>
        ))}
      </main>

      {formState && (
        <InitiativeForm
          pillars={pillars}
          initial={formState}
          onClose={() => setFormState(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}

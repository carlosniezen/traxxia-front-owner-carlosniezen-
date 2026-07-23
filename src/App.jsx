import React, { useEffect, useState } from 'react';
import {
  getProfile, getCategories, getPendingCheckins, getTolerance, getDashboard,
} from './api.js';
import Onboarding from './Onboarding.jsx';
import LogView from './LogView.jsx';
import CheckinView from './CheckinView.jsx';
import RecommendView from './RecommendView.jsx';
import DashboardView from './DashboardView.jsx';

const TABS = [
  { key: 'log', label: 'Registrar', icon: '➕' },
  { key: 'recommend', label: '¿Qué tomo?', icon: '🍸' },
  { key: 'dashboard', label: 'Mi semana', icon: '📊' },
];

export default function App() {
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [pending, setPending] = useState([]);
  const [tolerance, setTolerance] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [tab, setTab] = useState('log');
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const refresh = async () => {
    try {
      const [p, cats, pend, tol, dash] = await Promise.all([
        getProfile(), getCategories(), getPendingCheckins(), getTolerance(), getDashboard(),
      ]);
      setProfile(p);
      setCategories(cats);
      setPending(pend);
      setTolerance(tol);
      setDashboard(dash);
      setLoadError(null);
    } catch (e) {
      setLoadError(e.message);
    }
  };

  useEffect(() => { refresh(); }, []);

  if (loadError) {
    return (
      <div className="app">
        <div className="banner error">
          No se pudo conectar con la API de BienTomado ({loadError}). Arráncala con{' '}
          <code>npm start</code> en <code>traxxia-api</code> (http://localhost:4000).
        </div>
      </div>
    );
  }

  if (!profile) return <div className="app loading">Cargando…</div>;

  if (!profile.onboarded) {
    return <Onboarding onDone={refresh} />;
  }

  if (checkinOpen) {
    return (
      <div className="app">
        <Header pending={[]} onCheckin={() => {}} />
        <CheckinView pending={pending} onDone={async () => { await refresh(); setCheckinOpen(false); }} />
        <button className="btn ghost back" onClick={() => setCheckinOpen(false)}>← Volver</button>
      </div>
    );
  }

  return (
    <div className="app">
      <Header pending={pending} onCheckin={() => setCheckinOpen(true)} />

      {pending.length > 0 && (
        <button className="checkin-banner" onClick={() => setCheckinOpen(true)}>
          ☀️ Tienes {pending.length} {pending.length === 1 ? 'registro' : 'registros'} por evaluar —
          <strong> ¿cómo amaneciste?</strong>
        </button>
      )}

      <main className="content">
        {tab === 'log' && <LogView categories={categories} onLogged={refresh} />}
        {tab === 'recommend' && <RecommendView categories={categories} />}
        {tab === 'dashboard' && <DashboardView dashboard={dashboard} tolerance={tolerance} />}
      </main>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.key} className={'tabbtn' + (tab === t.key ? ' active' : '')}
            onClick={() => setTab(t.key)}>
            <span className="tabicon">{t.icon}</span>
            <span className="tablbl">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function Header() {
  return (
    <header className="brand">
      <h1>Bien<span>Tomado</span></h1>
      <p className="brand-tag">Toma menos y mejor — aprende cómo te cae a ti.</p>
    </header>
  );
}

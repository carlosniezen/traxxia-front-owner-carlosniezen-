import React, { useEffect, useState } from 'react';
import { admin } from '../api.js';
import { useStore } from '../App.jsx';
import { Link, money } from '../lib.jsx';
import { STATUS_LABELS } from './Orders.jsx';

export default function Dashboard() {
  const { store } = useStore();
  const [stats, setStats] = useState(null);
  useEffect(() => { admin.stats().then(setStats).catch(() => setStats(null)); }, []);

  const sym = store.currency_symbol;
  if (!stats) return <p className="muted">Cargando…</p>;

  const cards = [
    ['Ventas', money(stats.revenue, sym), '💰'],
    ['Pedidos', stats.orders, '🧾'],
    ['Pendientes', stats.pending, '⏳'],
    ['Productos', stats.products, '📦'],
    ['Bajo stock', stats.lowStock, '⚠️'],
  ];

  return (
    <div>
      <h1>Resumen</h1>
      <div className="stat-grid">
        {cards.map(([label, value, icon]) => (
          <div className="stat" key={label}>
            <span className="stat-icon">{icon}</span>
            <div><span className="stat-value">{value}</span><span className="stat-label">{label}</span></div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head"><h2>Pedidos recientes</h2><Link to="/admin/orders" className="link">Ver todos →</Link></div>
        {stats.recent.length === 0 ? <p className="muted">Aún no hay pedidos.</p> : (
          <table className="table">
            <thead><tr><th>Código</th><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead>
            <tbody>
              {stats.recent.map((o) => (
                <tr key={o.id}>
                  <td><strong>{o.code}</strong></td>
                  <td>{o.customer_name}</td>
                  <td>{money(o.total, sym)}</td>
                  <td><span className={`pill s-${o.status}`}>{STATUS_LABELS[o.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

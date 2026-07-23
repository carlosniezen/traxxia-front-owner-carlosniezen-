import React, { useEffect, useState } from 'react';
import { admin, getToken, setToken } from '../api.js';
import { useRoute, navigate, Link } from '../lib.jsx';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import Products from './Products.jsx';
import Orders from './Orders.jsx';
import Coupons from './Coupons.jsx';
import Settings from './Settings.jsx';

export default function Admin() {
  const route = useRoute();
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out

  useEffect(() => {
    if (!getToken()) { setUser(null); return; }
    admin.me().then(setUser).catch(() => { setToken(null); setUser(null); });
  }, []);

  if (user === undefined) return <div className="center-msg">Cargando…</div>;
  if (!user) return <Login onLogin={setUser} />;

  const logout = async () => {
    try { await admin.logout(); } catch { /* ignore */ }
    setToken(null); setUser(null); navigate('/admin');
  };

  const sub = route.replace('/admin', '') || '/';
  let page;
  if (sub === '/' || sub === '') page = <Dashboard />;
  else if (sub.startsWith('/products')) page = <Products />;
  else if (sub.startsWith('/orders')) page = <Orders />;
  else if (sub.startsWith('/coupons')) page = <Coupons />;
  else if (sub.startsWith('/settings')) page = <Settings />;
  else page = <Dashboard />;

  const nav = [
    ['/admin', '📊 Resumen'],
    ['/admin/products', '📦 Productos'],
    ['/admin/orders', '🧾 Pedidos'],
    ['/admin/coupons', '🏷️ Cupones'],
    ['/admin/settings', '⚙️ Tienda'],
  ];

  return (
    <div className="admin">
      <aside className="admin-side">
        <div className="admin-logo">🛍️ MiTienda<br /><span>Panel</span></div>
        <nav>
          {nav.map(([to, label]) => {
            const active = to === '/admin' ? sub === '/' : sub.startsWith(to.replace('/admin', ''));
            return <Link key={to} to={to} className={active ? 'on' : ''}>{label}</Link>;
          })}
        </nav>
        <div className="admin-side-foot">
          <a href="#/" target="_blank" rel="noreferrer">Ver tienda ↗</a>
          <button onClick={logout}>Cerrar sesión</button>
          <span className="muted small">{user.email}</span>
        </div>
      </aside>
      <main className="admin-main">{page}</main>
    </div>
  );
}

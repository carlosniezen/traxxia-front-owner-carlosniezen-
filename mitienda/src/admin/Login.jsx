import React, { useState } from 'react';
import { admin, setToken } from '../api.js';
import { Link } from '../lib.jsx';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@mitienda.pe');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      const { token, user } = await admin.login(email, password);
      setToken(token);
      onLogin(user);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo">🛍️ MiTienda</div>
        <h1>Panel de administración</h1>
        <label>Correo<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {error && <p className="coupon-err">{error}</p>}
        <button className="btn-primary full" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
        <p className="muted small">Demo: admin@mitienda.pe / admin123</p>
        <Link to="/" className="muted small">← Volver a la tienda</Link>
      </form>
    </div>
  );
}

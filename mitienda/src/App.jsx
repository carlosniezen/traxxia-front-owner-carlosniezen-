import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';
import { useRoute } from './lib.jsx';
import Storefront from './storefront/Storefront.jsx';
import Admin from './admin/Admin.jsx';

// Store branding + categories are shared across the storefront.
const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);

export default function App() {
  const route = useRoute();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const reload = () => api.getStore().then(setData).catch((e) => setError(e.message));
  useEffect(() => { reload(); }, []);

  // Apply the merchant's brand colors as CSS variables.
  useEffect(() => {
    if (!data?.store) return;
    const r = document.documentElement.style;
    r.setProperty('--brand', data.store.primary_color || '#2563eb');
    r.setProperty('--accent', data.store.accent_color || '#f59e0b');
    document.title = data.store.name || 'MiTienda';
  }, [data]);

  const isAdmin = route.startsWith('/admin');

  if (error) return <div className="center-msg">No se pudo conectar con la API.<br /><small>{error}</small></div>;
  if (!data) return <div className="center-msg">Cargando…</div>;

  return (
    <StoreContext.Provider value={{ ...data, reload }}>
      {isAdmin ? <Admin /> : <Storefront />}
    </StoreContext.Provider>
  );
}

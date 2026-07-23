import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useStore } from '../App.jsx';
import { Link } from '../lib.jsx';
import { ProductCard } from './Storefront.jsx';

export default function Home({ category }) {
  const { store, categories } = useStore();
  const [products, setProducts] = useState(null);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setProducts(null);
    api.getProducts({ category, q: search }).then(setProducts).catch(() => setProducts([]));
  }, [category, search]);

  const activeCat = categories.find((c) => c.slug === category);

  return (
    <div>
      {!category && !search && (
        <section className="hero">
          <h1>{store.tagline || store.name}</h1>
          <p>{store.description}</p>
        </section>
      )}

      <div className="catalog-head">
        <div className="chips">
          <Link to="/" className={!category ? 'chip chip-on' : 'chip'}>Todos</Link>
          {categories.map((c) => (
            <Link key={c.id} to={`/category/${c.slug}`} className={category === c.slug ? 'chip chip-on' : 'chip'}>
              {c.name}
            </Link>
          ))}
        </div>
        <form className="search" onSubmit={(e) => { e.preventDefault(); setSearch(q); }}>
          <input placeholder="Buscar productos…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="submit">Buscar</button>
        </form>
      </div>

      {activeCat && <h2 className="section-title">{activeCat.name}</h2>}
      {search && <h2 className="section-title">Resultados para “{search}”</h2>}

      {products === null ? (
        <p className="muted">Cargando productos…</p>
      ) : products.length === 0 ? (
        <p className="muted">No se encontraron productos.</p>
      ) : (
        <div className="grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}

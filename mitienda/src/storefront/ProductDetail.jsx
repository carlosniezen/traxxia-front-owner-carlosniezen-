import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useStore } from '../App.jsx';
import { Link, navigate, cartStore, money } from '../lib.jsx';

export default function ProductDetail({ slug }) {
  const { store } = useStore();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setProduct(null); setError(null);
    api.getProduct(slug).then(setProduct).catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <div className="pad"><p className="muted">Producto no encontrado.</p><Link to="/">← Volver</Link></div>;
  if (!product) return <p className="muted pad">Cargando…</p>;

  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  const outOfStock = product.stock <= 0;

  const addToCart = () => {
    cartStore.add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="pdp">
      <Link to="/" className="back-link">← Seguir comprando</Link>
      <div className="pdp-grid">
        <div className="pdp-img">
          {product.image_url ? <img src={product.image_url} alt={product.name} /> : <div className="card-img-ph">📦</div>}
        </div>
        <div className="pdp-info">
          {product.category_name && <span className="card-cat">{product.category_name}</span>}
          <h1>{product.name}</h1>
          <div className="pdp-price">
            <strong>{money(product.price, store.currency_symbol)}</strong>
            {onSale && <s>{money(product.compare_at_price, store.currency_symbol)}</s>}
          </div>
          <p className="pdp-desc">{product.description}</p>
          <p className={outOfStock ? 'stock out' : 'stock'}>
            {outOfStock ? 'Agotado' : `${product.stock} disponibles`}
          </p>
          {!outOfStock && (
            <div className="pdp-actions">
              <div className="qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <button className="btn-primary" onClick={addToCart}>Agregar al carrito</button>
              <button className="btn-outline" onClick={() => { cartStore.add(product, qty); navigate('/cart'); }}>
                Comprar ahora
              </button>
            </div>
          )}
          {added && <p className="toast">✔ Agregado al carrito</p>}
        </div>
      </div>
    </div>
  );
}

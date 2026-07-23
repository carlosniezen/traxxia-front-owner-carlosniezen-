import React from 'react';
import { useStore } from '../App.jsx';
import { Link, navigate, cartStore, useCart, money } from '../lib.jsx';

export default function Cart() {
  const { store } = useStore();
  const { items, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="pad center">
        <h2>Tu carrito está vacío</h2>
        <p className="muted">Explora el catálogo y agrega productos.</p>
        <Link to="/" className="btn-primary inline">Ir a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="cart">
      <h1>Tu carrito</h1>
      <div className="cart-grid">
        <div className="cart-items">
          {items.map((i) => (
            <div className="cart-row" key={i.id}>
              <div className="cart-row-img">
                {i.image_url ? <img src={i.image_url} alt={i.name} /> : <span>📦</span>}
              </div>
              <div className="cart-row-main">
                <Link to={`/product/${i.slug}`}><strong>{i.name}</strong></Link>
                <span className="muted">{money(i.price, store.currency_symbol)} c/u</span>
              </div>
              <div className="qty">
                <button onClick={() => cartStore.setQty(i.id, i.qty - 1)}>−</button>
                <span>{i.qty}</span>
                <button onClick={() => cartStore.setQty(i.id, i.qty + 1)}>+</button>
              </div>
              <strong className="cart-row-total">{money(i.price * i.qty, store.currency_symbol)}</strong>
              <button className="link-danger" onClick={() => cartStore.remove(i.id)}>✕</button>
            </div>
          ))}
        </div>
        <aside className="cart-summary">
          <h3>Resumen</h3>
          <div className="row"><span>Subtotal</span><strong>{money(subtotal, store.currency_symbol)}</strong></div>
          <p className="muted small">El envío y los descuentos se calculan en el checkout.</p>
          <button className="btn-primary full" onClick={() => navigate('/checkout')}>Ir a pagar</button>
          <Link to="/" className="continue">← Seguir comprando</Link>
        </aside>
      </div>
    </div>
  );
}

import React from 'react';
import { useStore } from '../App.jsx';
import { useRoute, Link, navigate, useCart, money } from '../lib.jsx';
import Home from './Home.jsx';
import ProductDetail from './ProductDetail.jsx';
import Cart from './Cart.jsx';
import Checkout from './Checkout.jsx';
import Confirmation from './Confirmation.jsx';

export default function Storefront() {
  const route = useRoute();

  let page;
  if (route === '/' || route.startsWith('/?')) page = <Home />;
  else if (route.startsWith('/category/')) page = <Home category={decodeURIComponent(route.split('/category/')[1])} />;
  else if (route.startsWith('/product/')) page = <ProductDetail slug={route.split('/product/')[1]} />;
  else if (route === '/cart') page = <Cart />;
  else if (route === '/checkout') page = <Checkout />;
  else if (route.startsWith('/order/')) page = <Confirmation code={route.split('/order/')[1]} />;
  else page = <Home />;

  return (
    <div className="sf">
      <Header />
      <main className="sf-main">{page}</main>
      <Footer />
    </div>
  );
}

function Header() {
  const { store, categories } = useStore();
  const { count } = useCart();
  return (
    <header className="sf-header">
      <div className="sf-header-inner">
        <Link to="/" className="sf-brand">
          {store.logo_url
            ? <img src={store.logo_url} alt={store.name} className="sf-logo" />
            : <span className="sf-logo-badge">🛍️</span>}
          <span>{store.name}</span>
        </Link>
        <nav className="sf-nav">
          <Link to="/">Inicio</Link>
          {categories.slice(0, 4).map((c) => (
            <Link key={c.id} to={`/category/${c.slug}`}>{c.name}</Link>
          ))}
        </nav>
        <Link to="/cart" className="sf-cart-btn">
          🛒 <span>Carrito</span>
          {count > 0 && <span className="sf-cart-count">{count}</span>}
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  const { store } = useStore();
  return (
    <footer className="sf-footer">
      <div className="sf-footer-inner">
        <div>
          <strong>{store.name}</strong>
          <p>{store.description}</p>
        </div>
        <div>
          {store.address && <p>📍 {store.address}</p>}
          {store.whatsapp && <p>📱 {store.whatsapp}</p>}
          {store.email && <p>✉️ {store.email}</p>}
        </div>
        <div className="sf-footer-meta">
          <p>Hecho con <strong>MiTienda</strong></p>
          <Link to="/admin">Panel de administración →</Link>
        </div>
      </div>
    </footer>
  );
}

// Shared product card used by Home and search results.
export function ProductCard({ product }) {
  const { store } = useStore();
  const onSale = product.compare_at_price && product.compare_at_price > product.price;
  return (
    <div className="card" onClick={() => navigate(`/product/${product.slug}`)}>
      <div className="card-img">
        {product.image_url ? <img src={product.image_url} alt={product.name} /> : <div className="card-img-ph">📦</div>}
        {onSale && <span className="badge-sale">Oferta</span>}
      </div>
      <div className="card-body">
        <h3>{product.name}</h3>
        {product.category_name && <span className="card-cat">{product.category_name}</span>}
        <div className="card-price">
          <strong>{money(product.price, store.currency_symbol)}</strong>
          {onSale && <s>{money(product.compare_at_price, store.currency_symbol)}</s>}
        </div>
      </div>
    </div>
  );
}

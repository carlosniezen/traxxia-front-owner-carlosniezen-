// Small shared utilities: hash router, cart store, money formatting.
import { useEffect, useState, useSyncExternalStore } from 'react';

// --- Money -----------------------------------------------------------------
// Prices come from the API as integer cents.
export function money(cents, symbol = 'S/') {
  return `${symbol} ${(Number(cents || 0) / 100).toFixed(2)}`;
}
export const toCents = (v) => Math.round(parseFloat(v || 0) * 100);
export const fromCents = (c) => (Number(c || 0) / 100).toFixed(2);

// --- Tiny hash router ------------------------------------------------------
// Routes look like "#/", "#/product/slug", "#/admin/products".
export function useRoute() {
  const get = () => window.location.hash.replace(/^#/, '') || '/';
  const [path, setPath] = useState(get());
  useEffect(() => {
    const onChange = () => setPath(get());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}
export function navigate(path) {
  window.location.hash = path;
  window.scrollTo(0, 0);
}
export function Link({ to, children, ...rest }) {
  return (
    <a href={'#' + to} {...rest} onClick={(e) => { e.preventDefault(); navigate(to); }}>
      {children}
    </a>
  );
}

// --- Cart store (localStorage + external store for React) ------------------
const CART_KEY = 'mitienda_cart';
let cart = load();
const listeners = new Set();

function load() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function persist() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  listeners.forEach((l) => l());
}

export const cartStore = {
  subscribe(l) { listeners.add(l); return () => listeners.delete(l); },
  get() { return cart; },
  add(product, qty = 1) {
    const existing = cart.find((i) => i.id === product.id);
    if (existing) existing.qty += qty;
    else cart = [...cart, { id: product.id, name: product.name, price: product.price, image_url: product.image_url, slug: product.slug, qty }];
    cart = [...cart];
    persist();
  },
  setQty(id, qty) {
    cart = cart.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i));
    persist();
  },
  remove(id) { cart = cart.filter((i) => i.id !== id); persist(); },
  clear() { cart = []; persist(); },
};

export function useCart() {
  const items = useSyncExternalStore(cartStore.subscribe, cartStore.get);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  return { items, count, subtotal };
}

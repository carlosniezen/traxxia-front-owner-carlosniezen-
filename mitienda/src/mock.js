// In-browser "demo mode" backend. Implements the same interface as api.js/admin
// but backed entirely by localStorage, so the app works with no server (e.g. on
// GitHub Pages). Enabled at build time with VITE_DEMO=1.
const KEY = 'mitienda_demo_db_v1';

function img(emoji, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="${color}"/><text x="50%" y="50%" font-size="180" text-anchor="middle" dominant-baseline="central">${emoji}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
const slugify = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function seed() {
  const categories = [
    { id: 1, name: 'Tecnología', slug: 'tecnologia' },
    { id: 2, name: 'Ropa', slug: 'ropa' },
    { id: 3, name: 'Hogar', slug: 'hogar' },
    { id: 4, name: 'Accesorios', slug: 'accesorios' },
  ];
  const P = [
    [1, 'tecnologia', 'Audífonos Bluetooth Pro', 12900, 17900, 40, 1, 'Audífonos inalámbricos con cancelación de ruido y 30h de batería.', '🎧', '#2563eb'],
    [2, 'tecnologia', 'Smartwatch Fit 2', 19900, 24900, 25, 1, 'Reloj inteligente con GPS, ritmo cardíaco y resistencia al agua.', '⌚', '#0ea5e9'],
    [3, 'tecnologia', 'Cargador Rápido 65W', 8900, null, 60, 0, 'Cargador USB-C de carga rápida para laptops y celulares.', '🔌', '#6366f1'],
    [4, 'ropa', 'Polo Algodón Premium', 4900, 6900, 100, 1, 'Polo 100% algodón pima, suave y fresco.', '👕', '#f59e0b'],
    [5, 'ropa', 'Casaca Impermeable', 15900, null, 30, 0, 'Casaca ligera resistente al agua, ideal para la ciudad.', '🧥', '#10b981'],
    [6, 'hogar', 'Set de Tazas x4', 5900, null, 45, 0, 'Juego de 4 tazas de cerámica esmaltada, aptas para microondas.', '☕', '#ef4444'],
    [7, 'hogar', 'Lámpara LED de Escritorio', 7900, 9900, 35, 0, 'Lámpara con brazo ajustable, 3 niveles de brillo y puerto USB.', '💡', '#f59e0b'],
    [8, 'accesorios', 'Mochila Urbana', 11900, null, 50, 1, 'Mochila resistente con compartimento para laptop de 15".', '🎒', '#8b5cf6'],
    [9, 'accesorios', 'Billetera de Cuero', 6900, null, 70, 0, 'Billetera de cuero genuino con protección RFID.', '👛', '#78350f'],
  ];
  const catId = (slug) => categories.find((c) => c.slug === slug).id;
  const products = P.map(([id, cat, name, price, compare, stock, featured, desc, emoji, color], i) => ({
    id, category_id: catId(cat), name, slug: slugify(name), description: desc, price,
    compare_at_price: compare, sku: `SKU-${1000 + i}`, stock, image_url: img(emoji, color),
    active: 1, featured, category_name: categories.find((c) => c.slug === cat).name, category_slug: cat,
    created_at: new Date(Date.now() - i * 3600000).toISOString(),
  }));
  return {
    store: {
      id: 1, name: 'Mi Tienda Demo', slug: 'mi-tienda-demo',
      tagline: 'Todo lo que necesitas, a un clic',
      description: 'Tienda virtual de demostración creada con la plataforma MiTienda.',
      logo_url: null, primary_color: '#2563eb', accent_color: '#f59e0b',
      currency: 'PEN', currency_symbol: 'S/', whatsapp: '+51 999 888 777',
      email: 'ventas@mitienda-demo.pe', address: 'Av. Ejemplo 123, Lima, Perú',
    },
    categories, products,
    coupons: [
      { id: 1, code: 'BIENVENIDA10', type: 'percent', value: 10, min_subtotal: 0, active: 1, expires_at: null },
      { id: 2, code: 'ENVIOGRATIS', type: 'fixed', value: 1500, min_subtotal: 10000, active: 1, expires_at: null },
    ],
    orders: [], order_items: [], seq: { product: 10, category: 5, coupon: 3, order: 1 },
  };
}

function load() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.store) return d; } catch { /* ignore */ }
  const fresh = seed();
  localStorage.setItem(KEY, JSON.stringify(fresh));
  return fresh;
}
let db = load();
const save = () => localStorage.setItem(KEY, JSON.stringify(db));
const clone = (x) => JSON.parse(JSON.stringify(x));
const delay = (v) => new Promise((r) => setTimeout(() => r(clone(v)), 120));
const fail = (msg) => Promise.reject(new Error(msg));

function evaluateCoupon(code, subtotal) {
  if (!code) return { ok: true, discount: 0, coupon: null };
  const c = db.coupons.find((x) => x.code.toLowerCase() === String(code).trim().toLowerCase() && x.active);
  if (!c) return { ok: false, error: 'Cupón no válido' };
  if (subtotal < (c.min_subtotal || 0)) return { ok: false, error: 'El pedido no alcanza el mínimo para este cupón' };
  let discount = c.type === 'percent' ? Math.round(subtotal * (c.value / 100)) : c.value;
  return { ok: true, discount: Math.min(discount, subtotal), coupon: c };
}
const withCat = (p) => ({ ...p, category_name: db.categories.find((c) => c.id === p.category_id)?.name || null,
  category_slug: db.categories.find((c) => c.id === p.category_id)?.slug || null });

// ---- Public storefront ----
export const mockApi = {
  getStore: () => delay({ store: db.store, categories: db.categories }),
  getProducts: (params = {}) => {
    let rows = db.products.filter((p) => p.active);
    if (params.category) rows = rows.filter((p) => db.categories.find((c) => c.id === p.category_id)?.slug === params.category);
    if (params.featured) rows = rows.filter((p) => p.featured);
    if (params.q) { const q = params.q.toLowerCase(); rows = rows.filter((p) => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)); }
    rows = rows.slice().sort((a, b) => (b.featured - a.featured) || (b.id - a.id));
    return delay(rows.map(withCat));
  },
  getProduct: (slug) => { const p = db.products.find((x) => x.slug === slug && x.active); return p ? delay(withCat(p)) : fail('Producto no encontrado'); },
  validateCoupon: (code, subtotal) => { const r = evaluateCoupon(code, Number(subtotal)); return r.ok ? delay({ discount: r.discount, code: r.coupon?.code || null }) : fail(r.error); },
  createOrder: ({ customer = {}, items = [], coupon = null, payment_method = 'contra_entrega' }) => {
    if (!customer.name) return fail('El nombre del cliente es obligatorio');
    if (!items.length) return fail('El carrito está vacío');
    let subtotal = 0; const resolved = [];
    for (const it of items) {
      const p = db.products.find((x) => x.id === it.product_id && x.active);
      if (!p) return fail('Producto no disponible');
      const qty = Math.max(1, parseInt(it.qty, 10) || 1);
      if (p.stock < qty) return fail(`Sin stock suficiente para "${p.name}"`);
      resolved.push({ p, qty }); subtotal += p.price * qty;
    }
    const cp = evaluateCoupon(coupon, subtotal);
    if (!cp.ok) return fail(cp.error);
    const discount = cp.discount;
    const shipping = subtotal - discount >= 10000 ? 0 : 1000;
    const total = subtotal - discount + shipping;
    const id = db.seq.order++;
    const code = 'MT-' + Math.random().toString(16).slice(2, 8).toUpperCase();
    const order = { id, code, customer_name: customer.name, customer_email: customer.email || null,
      customer_phone: customer.phone || null, address: customer.address || null, city: customer.city || null,
      notes: customer.notes || null, subtotal, discount, shipping, total, coupon_code: cp.coupon?.code || null,
      payment_method, status: 'pending', created_at: new Date().toISOString() };
    db.orders.push(order);
    resolved.forEach(({ p, qty }) => { db.order_items.push({ id: db.order_items.length + 1, order_id: id, product_id: p.id, name: p.name, price: p.price, qty }); p.stock -= qty; });
    save();
    return delay({ id, code, subtotal, discount, shipping, total });
  },
};

// ---- Admin ----
const DEMO_TOKEN = 'demo-token';
export const mockAdmin = {
  login: (email, password) => (String(email).toLowerCase() === 'admin@mitienda.pe' && password === 'admin123')
    ? delay({ token: DEMO_TOKEN, user: { id: 1, email: 'admin@mitienda.pe', name: 'Administrador' } })
    : fail('Credenciales incorrectas'),
  logout: () => delay({ ok: true }),
  me: () => delay({ id: 1, email: 'admin@mitienda.pe', name: 'Administrador' }),
  stats: () => {
    const active = db.orders.filter((o) => o.status !== 'cancelled');
    return delay({
      revenue: active.reduce((s, o) => s + o.total, 0),
      orders: db.orders.length,
      pending: db.orders.filter((o) => o.status === 'pending').length,
      products: db.products.length,
      lowStock: db.products.filter((p) => p.stock <= 5 && p.active).length,
      recent: db.orders.slice(-5).reverse().map((o) => ({ id: o.id, code: o.code, customer_name: o.customer_name, total: o.total, status: o.status, created_at: o.created_at })),
    });
  },
  products: () => delay(db.products.slice().sort((a, b) => b.id - a.id).map(withCat)),
  createProduct: (b) => {
    const id = db.seq.product++;
    const p = { id, category_id: b.category_id || null, name: b.name, slug: slugify(b.name) + '-' + id,
      description: b.description || null, price: b.price || 0, compare_at_price: b.compare_at_price || null,
      sku: b.sku || null, stock: b.stock || 0, image_url: b.image_url || null,
      active: b.active === false ? 0 : 1, featured: b.featured ? 1 : 0, created_at: new Date().toISOString() };
    db.products.push(p); save(); return delay(p);
  },
  updateProduct: (id, b) => {
    const p = db.products.find((x) => x.id === Number(id)); if (!p) return fail('Producto no encontrado');
    Object.assign(p, {
      category_id: b.category_id ?? p.category_id, name: b.name ?? p.name, description: b.description ?? p.description,
      price: b.price != null ? b.price : p.price, compare_at_price: b.compare_at_price != null ? b.compare_at_price : p.compare_at_price,
      sku: b.sku ?? p.sku, stock: b.stock != null ? b.stock : p.stock, image_url: b.image_url ?? p.image_url,
      active: b.active != null ? (b.active ? 1 : 0) : p.active, featured: b.featured != null ? (b.featured ? 1 : 0) : p.featured,
    }); save(); return delay(p);
  },
  deleteProduct: (id) => { db.products = db.products.filter((p) => p.id !== Number(id)); save(); return delay({ ok: true }); },
  categories: () => delay(db.categories),
  createCategory: ({ name }) => { const id = db.seq.category++; const c = { id, name, slug: slugify(name) + '-' + id, position: id }; db.categories.push(c); save(); return delay(c); },
  deleteCategory: (id) => { db.categories = db.categories.filter((c) => c.id !== Number(id)); save(); return delay({ ok: true }); },
  orders: (status) => delay(db.orders.slice().reverse().filter((o) => !status || o.status === status)),
  order: (id) => { const o = db.orders.find((x) => x.id === Number(id)); if (!o) return fail('Pedido no encontrado'); return delay({ ...o, items: db.order_items.filter((it) => it.order_id === o.id) }); },
  setOrderStatus: (id, status) => { const o = db.orders.find((x) => x.id === Number(id)); if (!o) return fail('Pedido no encontrado'); o.status = status; save(); return delay(o); },
  updateStore: (b) => { Object.assign(db.store, b); save(); return delay(db.store); },
  coupons: () => delay(db.coupons.slice().reverse()),
  createCoupon: (b) => {
    if (db.coupons.some((c) => c.code === String(b.code).toUpperCase().trim())) return fail('Ese código de cupón ya existe');
    const id = db.seq.coupon++; const c = { id, code: String(b.code).toUpperCase().trim(), type: b.type === 'fixed' ? 'fixed' : 'percent', value: b.value || 0, min_subtotal: b.min_subtotal || 0, active: b.active === false ? 0 : 1, expires_at: b.expires_at || null };
    db.coupons.push(c); save(); return delay(c);
  },
  deleteCoupon: (id) => { db.coupons = db.coupons.filter((c) => c.id !== Number(id)); save(); return delay({ ok: true }); },
};

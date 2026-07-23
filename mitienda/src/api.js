// Thin fetch wrapper for the MiTienda API (public + admin).
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4100') + '/api';

const TOKEN_KEY = 'mitienda_admin_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

// --- Public storefront ---
export const api = {
  getStore: () => request('/store'),
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request('/products' + (qs ? `?${qs}` : ''));
  },
  getProduct: (slug) => request(`/products/${slug}`),
  validateCoupon: (code, subtotal) => request('/coupons/validate', { method: 'POST', body: { code, subtotal } }),
  createOrder: (payload) => request('/orders', { method: 'POST', body: payload }),
};

// --- Admin (authenticated) ---
export const admin = {
  login: (email, password) => request('/admin/login', { method: 'POST', body: { email, password } }),
  logout: () => request('/admin/logout', { method: 'POST', auth: true }),
  me: () => request('/admin/me', { auth: true }),
  stats: () => request('/admin/stats', { auth: true }),

  products: () => request('/admin/products', { auth: true }),
  createProduct: (p) => request('/admin/products', { method: 'POST', body: p, auth: true }),
  updateProduct: (id, p) => request(`/admin/products/${id}`, { method: 'PUT', body: p, auth: true }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE', auth: true }),

  categories: () => request('/admin/categories', { auth: true }),
  createCategory: (c) => request('/admin/categories', { method: 'POST', body: c, auth: true }),
  deleteCategory: (id) => request(`/admin/categories/${id}`, { method: 'DELETE', auth: true }),

  orders: (status) => request('/admin/orders' + (status ? `?status=${status}` : ''), { auth: true }),
  order: (id) => request(`/admin/orders/${id}`, { auth: true }),
  setOrderStatus: (id, status) => request(`/admin/orders/${id}/status`, { method: 'PUT', body: { status }, auth: true }),

  updateStore: (s) => request('/admin/store', { method: 'PUT', body: s, auth: true }),

  coupons: () => request('/admin/coupons', { auth: true }),
  createCoupon: (c) => request('/admin/coupons', { method: 'POST', body: c, auth: true }),
  deleteCoupon: (id) => request(`/admin/coupons/${id}`, { method: 'DELETE', auth: true }),
};

// BienTomado API client.
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const getProfile = () => request('/profile');
export const saveProfile = (data) =>
  request('/profile', { method: 'PUT', body: JSON.stringify(data) });

export const getCategories = () => request('/categories');

export const logDrink = (data) =>
  request('/logs', { method: 'POST', body: JSON.stringify(data) });
export const getLogs = (days = 30) => request(`/logs?days=${days}`);
export const deleteLog = (id) => request(`/logs/${id}`, { method: 'DELETE' });

export const getPendingCheckins = () => request('/checkins/pending');
export const submitCheckin = (data) =>
  request('/checkins', { method: 'POST', body: JSON.stringify(data) });

export const getTolerance = () => request('/tolerance');
export const getRecommendation = (data) =>
  request('/recommend', { method: 'POST', body: JSON.stringify(data) });
export const getDashboard = () => request('/dashboard');

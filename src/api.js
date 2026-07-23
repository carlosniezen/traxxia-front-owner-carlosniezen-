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

export const getAgenda = () => request('/agenda');
export const updatePillar = (id, data) =>
  request(`/pillars/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const createInitiative = (data) =>
  request('/initiatives', { method: 'POST', body: JSON.stringify(data) });
export const updateInitiative = (id, data) =>
  request(`/initiatives/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteInitiative = (id) =>
  request(`/initiatives/${id}`, { method: 'DELETE' });

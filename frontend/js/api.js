/**
 * api.js — Backend connector for hiphxp.id
 * 
 * Auto-detects environment:
 * - localhost / 127.0.0.1  → uses local dev backend
 * - anything else          → uses production backend
 */

const IS_LOCAL = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
const API_BASE_URL = IS_LOCAL ? 'http://localhost:4000' : 'https://hiphxp.mooo.com';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[API] ${path} failed:`, error.message);
    throw error;
  }
}

// ─── Endpoints ─────────────────────────────────────────────────────────────

/** GET /api/dashboard/stats */
export async function getStats() {
  return apiFetch('/api/dashboard/stats');
}

/** GET /api/songs */
export async function getSongs(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/songs${qs ? '?' + qs : ''}`);
}

/** GET /api/artists */
export async function getArtists(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/artists${qs ? '?' + qs : ''}`);
}

/** GET /api/events */
export async function getEvents(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/events${qs ? '?' + qs : ''}`);
}

/** GET /api/content/articles */
export async function getArticles(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/content/articles${qs ? '?' + qs : ''}`);
}

/** POST /api/partnerships — submit partnership inquiry */
export async function submitPartnership(data) {
  return apiFetch('/api/partnerships', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

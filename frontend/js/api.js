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

/** GET /api/collectives */
export async function getCollectives(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/collectives${qs ? '?' + qs : ''}`);
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

/** GET /api/content/lifestyle (streetwear, graffiti, dance) */
export async function getLifestyle(category = 'streetwear', params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/content/lifestyle/${category}${qs ? '?' + qs : ''}`);
}

/** GET /api/content/editorials (interviews, longforms, features) */
export async function getEditorials(category = 'interviews', params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/content/editorials/${category}${qs ? '?' + qs : ''}`);
}

/** GET /api/content/reviews (music, radar) */
export async function getReviews(category = 'music', params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/content/reviews/${category}${qs ? '?' + qs : ''}`);
}

/** POST /api/partnerships — submit partnership inquiry */
export async function submitPartnership(data) {
  return apiFetch('/api/partnerships', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Auth & Musician Dashboard ─────────────────────────────────────────────

export async function loginMusician(email, password) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function registerMusician(data) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/** POST /api/songs */
export async function submitSong(formData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/songs`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData // No Content-Type header so browser sets multipart boundary automatically
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[API] /api/songs failed:`, error.message);
    throw error;
  }
}

/** GET /api/artists/me/profile */
export async function getMyProfile(token) {
  return apiFetch('/api/artists/me/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

/** PUT /api/artists/me/profile */
export async function updateMyProfile(formData, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/artists/me/profile`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(err.message || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[API] /api/artists/me/profile failed:`, error.message);
    throw error;
  }
}

/** POST /api/events */
export async function submitEvent(data, token) {
  return apiFetch('/api/events', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
}

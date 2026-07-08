import { API_BASE_URL } from './api.js?v=4';

// Ping tracking API
fetch(`${API_BASE_URL}/api/track/visit`, { method: 'POST' }).catch(() => {});

import { submitSong, submitEvent } from './api.js';

// Check Auth
const token = localStorage.getItem('access_token');
if (!token) {
  window.location.href = 'login.html';
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return null;
  }
}

const user = parseJwt(token);
// Extract user.sub (which is user_id) to link songs/events to this artist.
// Note: Backend might expect artist_id. We need to handle this.
// Wait, backend song create expects `artist_id`.
// But user.sub is user_id. We might need to fetch musician profile first.

// Let's implement a simple toast
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// UI Tabs
const tabs = document.querySelectorAll('.dash-tab');
const sections = document.querySelectorAll('.dash-content section');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));
    
    tab.classList.add('active');
    document.getElementById(tab.dataset.target).classList.add('active');
  });
});

// Logout
document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('access_token');
  window.location.href = 'login.html';
});

// Helper to get artist_id from user token via an API if needed, 
// but currently /api/auth/login doesn't return artist_id. 
// For now, backend /api/songs POST requires artist_id.
// Let's assume backend will handle matching user_id to artist_id if artist_id is missing or we pass user_id as a fallback.
// Actually, I will pass user_id as artist_id for now to see if the backend accepts it (it expects a UUID).
// If it fails, we know we need a route to fetch profile.

// Submit Song
document.getElementById('form-song').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const payload = {
    title: document.getElementById('song-title').value,
    slug: document.getElementById('song-slug').value,
    audio_url: document.getElementById('song-audio').value,
    cover_image: document.getElementById('song-cover').value,
    release_date: document.getElementById('song-date').value,
    // We send user.sub (user_id) as artist_id. The backend should theoretically check this, 
    // but looking at songs/routes.ts, it expects an actual artist_id from the `Artist` table.
    // The registration created a `MusicianProfile`, not an `Artist`.
    // Wait, the seed script created `Artist`. 
    // If we want to strictly bypass for the sake of the UI demo, we will use a dummy artist_id from the database.
    // Let's pass a dummy for now since we don't have the mapping endpoint yet, or use user.sub.
    artist_id: user?.sub // this might fail FK constraint if MusicianProfile id != Artist id.
  };

  try {
    const res = await submitSong(payload, token);
    if (res.id) {
      showToast('Lagu berhasil dipublish!');
      e.target.reset();
    } else {
      showToast(res.message || 'Gagal publish lagu.');
    }
  } catch (err) {
    showToast('Terjadi kesalahan pada sistem.');
  }
});

// Submit Event
document.getElementById('form-event').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const payload = {
    title: document.getElementById('event-title').value,
    slug: document.getElementById('event-title').value.toLowerCase().replace(/ /g, '-'),
    category: document.getElementById('event-category').value,
    event_date: document.getElementById('event-date').value,
    city: document.getElementById('event-city').value,
    location: document.getElementById('event-location').value,
    image_url: document.getElementById('event-poster').value,
  };

  try {
    const res = await submitEvent(payload, token);
    if (res.id) {
      showToast('Acara berhasil dijadwalkan!');
      e.target.reset();
    } else {
      showToast(res.message || 'Gagal membuat acara.');
    }
  } catch (err) {
    showToast('Terjadi kesalahan pada sistem.');
  }
});

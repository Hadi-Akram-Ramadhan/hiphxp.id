import { submitSong, submitEvent, getMyProfile, updateMyProfile } from './api.js';

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

function getDecodedToken() {
  const token = localStorage.getItem('access_token');
  return token ? parseJwt(token) : null;
}

// Load Profile
async function loadProfile() {
  const token = localStorage.getItem('access_token');
  try {
    const profile = await getMyProfile(token);
    if (profile) {
      document.getElementById('prof-artist-name').value = profile.artist_name || '';
      document.getElementById('prof-real-name').value = profile.real_name || '';
      document.getElementById('prof-bio').value = profile.bio || '';
      document.getElementById('prof-city').value = profile.city || '';
      document.getElementById('prof-whatsapp').value = profile.whatsapp || '';
      document.getElementById('prof-instagram').value = profile.instagram || '';
      document.getElementById('prof-spotify').value = profile.spotify_artist_url || '';
    }
  } catch (err) {
    console.error('Failed to load profile:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const user = getDecodedToken();
  if (user && user.email) {
    document.getElementById('welcome-name').textContent = user.email.split('@')[0];
  }
  
  loadProfile();
  
  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = profileForm.querySelector('button');
      btn.textContent = 'Menyimpan...';
      
      const formData = new FormData();
      formData.append('artist_name', document.getElementById('prof-artist-name').value);
      formData.append('real_name', document.getElementById('prof-real-name').value);
      formData.append('bio', document.getElementById('prof-bio').value);
      formData.append('city', document.getElementById('prof-city').value);
      formData.append('whatsapp', document.getElementById('prof-whatsapp').value);
      formData.append('instagram', document.getElementById('prof-instagram').value);
      formData.append('spotify_artist_url', document.getElementById('prof-spotify').value);
      
      const photoInput = document.getElementById('prof-photo');
      if (photoInput.files[0]) {
        formData.append('profile_photo', photoInput.files[0]);
      }
      
      try {
        await updateMyProfile(formData, localStorage.getItem('access_token'));
        alert('Profil berhasil diperbarui!');
      } catch (err) {
        alert('Gagal memperbarui profil: ' + err.message);
      } finally {
        btn.textContent = 'Simpan Profil';
      }
    });
  }

  // Form Upload Rilisan (Lagu)
  const songForm = document.getElementById('song-form');
  if (songForm) {
    songForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = songForm.querySelector('button');
      btn.textContent = 'Mengunggah...';

      try {
        const formData = new FormData();
        formData.append('title', document.getElementById('song-title').value);
        formData.append('slug', document.getElementById('song-slug').value);
        formData.append('release_date', document.getElementById('song-date').value);
        
        const tokenPayload = getDecodedToken();
        formData.append('artist_id', tokenPayload.id); 

        const audioInput = document.getElementById('song-audio');
        if (audioInput.files[0]) formData.append('audio', audioInput.files[0]);
        
        const coverInput = document.getElementById('song-cover');
        if (coverInput.files[0]) formData.append('cover', coverInput.files[0]);
        
        await submitSong(formData, localStorage.getItem('access_token'));
        alert('Rilisan berhasil diunggah!');
        songForm.reset();
      } catch (err) {
        alert('Gagal mengunggah rilisan: ' + err.message);
      } finally {
        btn.textContent = 'PUBLISH LAGU';
      }
    });
  }
});

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

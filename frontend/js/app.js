/**
 * app.js — Main application logic for hiphxp.id
 * Handles: API data fetching, dynamic rendering, filters, share, form submit
 */

import { getStats, getSongs, getCollectives, getEvents, submitPartnership, getLifestyle, getEditorials, getReviews } from './api.js';

// ─── Helpers ───────────────────────────────────────────────────────────────

function showToast(msg, duration = 3000) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function formatDate(dateStr) {
  if (!dateStr) return '–';
  const d = new Date(dateStr);
  return {
    day: d.getDate().toString().padStart(2, '0'),
    month: d.toLocaleString('id-ID', { month: 'short' }).toUpperCase(),
    full: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

function getInitials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function categoryLabel(cat) {
  const map = {
    FESTIVAL: 'Festival', GIG: 'Gigs', RAP_BATTLE: 'Rap Battle',
    STREET_EVENT: 'Street Event', WORKSHOP: 'Workshop', COMPETITION: 'Kompetisi',
  };
  return map[cat] || cat;
}

// ─── Stats ─────────────────────────────────────────────────────────────────

async function loadStats() {
  try {
    const stats = await getStats();
    const map = {
      'stat-songs': stats.music || stats.songs || 0,
      'stat-artists': stats.artists || 0,
      'stat-events': stats.events || 0,
    };
    for (const [id, val] of Object.entries(map)) {
      const el = document.getElementById(id);
      if (el) animateCount(el, val);
    }
  } catch {
    // fallback values already in HTML
  }
}

function animateCount(el, target) {
  let cur = 0;
  const step = Math.ceil(target / 40);
  const interval = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur + (target > 99 ? '+' : '');
    if (cur >= target) clearInterval(interval);
  }, 30);
}

// ─── Songs / Release Radar ─────────────────────────────────────────────────

async function loadSongs() {
  const grid = document.getElementById('releases-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="loading-spinner">Memuat rilisan...</div>';

  try {
    const data = await getSongs({ limit: 8 });
    const songs = Array.isArray(data) ? data : (data.data || []);

    if (!songs.length) {
      grid.innerHTML = '<div class="empty-state"><p>Belum ada lagu tersedia.</p></div>';
      return;
    }

    grid.innerHTML = songs.map(song => {
      const date = formatDate(song.release_date);
      const artistName = song.artist?.name || 'Unknown Artist';
      return `
        <div class="release-card">
          <div class="rc-tag">Rilisan Baru</div>
          <h4>${escHtml(song.title)}</h4>
          <div class="rc-artist mono">${escHtml(artistName)}</div>
          ${song.release_date ? `<div class="rc-date">${date.full}</div>` : ''}
        </div>
      `;
    }).join('');
  } catch {
    grid.innerHTML = '<div class="empty-state"><p>Gagal memuat rilisan. Coba lagi nanti.</p></div>';
  }
}

// ─── Community Hub — Collectives ───────────────────────────────────────────

let allCollectives = [];

async function loadCollectives(cityFilter = '') {
  const grid = document.getElementById('collective-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="loading-spinner" style="color:rgba(242,241,236,0.6)">Memuat direktori...</div>';

  try {
    const params = cityFilter ? { city: cityFilter } : {};
    const data = await getCollectives(params);
    allCollectives = Array.isArray(data) ? data : (data.data || []);

    renderCollectiveGrid(allCollectives);
  } catch {
    grid.innerHTML = '<div class="empty-state" style="color:rgba(242,241,236,0.6)"><p>Gagal memuat direktori.</p></div>';
  }
}

function renderCollectiveGrid(collectives) {
  const grid = document.getElementById('collective-grid');
  if (!grid) return;

  if (!collectives.length) {
    grid.innerHTML = '<div class="empty-state" style="color:rgba(242,241,236,0.6)"><p>Tidak ada kolektif ditemukan.</p></div>';
    return;
  }

  grid.innerHTML = collectives.map(a => `
    <div class="collective-card">
      <div class="collective-avatar">
        <span>${getInitials(a.name)}</span>
      </div>
      <h4>${escHtml(a.name)}</h4>
      <div class="city mono">${escHtml(a.city || '–')}</div>
      <p class="desc">${escHtml(a.bio || a.description || '')}</p>
    </div>
  `).join('');
}

function initCityFilter() {
  const chips = document.querySelectorAll('.chip[data-city]');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const city = chip.dataset.city;
      loadCollectives(city === 'all' ? '' : city);
    });
  });
}

// ─── Events ────────────────────────────────────────────────────────────────

async function loadEvents(params = {}) {
  const list = document.getElementById('event-list');
  if (!list) return;

  list.innerHTML = '<div class="loading-spinner" style="color:rgba(242,241,236,0.6)">Memuat agenda...</div>';

  try {
    const data = await getEvents(params);
    const events = Array.isArray(data) ? data : (data.data || []);
    renderEventList(events);
  } catch {
    list.innerHTML = '<div class="empty-state" style="color:rgba(242,241,236,0.6)"><p>Gagal memuat agenda.</p></div>';
  }
}

function renderEventList(events) {
  const list = document.getElementById('event-list');
  if (!list) return;

  if (!events.length) {
    list.innerHTML = '<div class="empty-state" style="color:rgba(242,241,236,0.6)"><p>Tidak ada acara ditemukan.</p></div>';
    return;
  }

  list.innerHTML = events.map(ev => {
    const date = formatDate(ev.event_date);
    const organizer = ev.organizer || '';
    const city = ev.city || '';
    const subtitle = [organizer, city].filter(Boolean).join(' · ');
    return `
      <div class="event-row">
        <div class="event-date">
          <div class="d">${date.day}</div>
          <div class="m">${date.month}</div>
        </div>
        <div class="event-info">
          <h5>${escHtml(ev.name)}</h5>
          <span>${escHtml(subtitle)}</span>
        </div>
        <div class="event-badge">${categoryLabel(ev.category)}</div>
      </div>
    `;
  }).join('');
}

function initEventFilters() {
  const btnFilter = document.getElementById('btn-filter-events');
  if (!btnFilter) return;

  btnFilter.addEventListener('click', () => {
    const city = document.getElementById('filter-city')?.value || '';
    const date = document.getElementById('filter-date')?.value || '';
    const category = document.getElementById('filter-category')?.value || '';

    const params = {};
    if (city) params.city = city;
    if (date) { params.startDate = date; params.endDate = date; }
    if (category) params.category = category;
    loadEvents(params);
  });
}

// ─── Partnership Form ──────────────────────────────────────────────────────

function initPartnershipForm() {
  const form = document.getElementById('partnership-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const name = document.getElementById('p-name')?.value?.trim();
    const email = document.getElementById('p-email')?.value?.trim();
    const needs = document.getElementById('p-needs')?.value?.trim();

    if (!name || !email || !needs) {
      showToast('⚠️ Isi semua field sebelum mengirim.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Mengirim...';

    try {
      await submitPartnership({
        brand_name: name,
        contact_email: email,
        message: needs,
      });
      showToast('✅ Pesan terkirim! Kami akan balas dalam 1×24 jam.');
      form.reset();
    } catch {
      showToast('❌ Gagal mengirim. Coba lagi atau hubungi via WhatsApp.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Kirim Pesan →';
    }
  });
}

// ─── Social Share ──────────────────────────────────────────────────────────

function initShareButtons() {
  const pageUrl = encodeURIComponent(window.location.href);
  const pageTitle = encodeURIComponent(document.title);

  const shareHandlers = {
    'share-wa': () => window.open(`https://wa.me/?text=${pageTitle}%20${pageUrl}`, '_blank'),
    'share-x': () => window.open(`https://twitter.com/intent/tweet?text=${pageTitle}&url=${pageUrl}`, '_blank'),
    'share-ig': () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('📸 Link disalin! Paste di Instagram Stories kamu.');
      });
    },
    'share-tiktok': () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('🎵 Link disalin! Paste di TikTok kamu.');
      });
    },
  };

  for (const [id, handler] of Object.entries(shareHandlers)) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', handler);
  }
}

// ─── Mobile Menu ───────────────────────────────────────────────────────────

function initMobileMenu() {
  const hamburger = document.getElementById('nav-hamburger');
  const menu = document.getElementById('mobile-menu');
  const close = document.getElementById('mobile-close');

  hamburger?.addEventListener('click', () => menu?.classList.add('open'));
  close?.addEventListener('click', () => menu?.classList.remove('open'));
  menu?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('open'));
  });
}

// ─── Escape HTML ───────────────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Init ──────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  loadSongs();
  loadCollectives();
  loadEvents();
  initCityFilter();
  initEventFilters();
  initPartnershipForm();
  initShareButtons();
  initMobileMenu();
});

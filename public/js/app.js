// public/js/app.js
// Core client logic for the Home/Events pages

import { initDefaultState, getSession } from './storage.js';

/* ---------- tiny helpers ---------- */
export const qs  = (sel, ctx = document) => ctx.querySelector(sel);
export const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
export const fmtMin = (min) => `${min} min`;

/* ---------- PWA: service worker ---------- */
function registerSW() {
  if ('serviceWorker' in navigator) {
    // best-effort; avoid unhandled promise rejections in some browsers
    try { navigator.serviceWorker.register('./sw.js'); } catch {}
  }
}

/* ---------- content loaders ---------- */
async function loadEpisodes() {
  try {
    const res = await fetch('./data/episodes.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.episodes || [];
  } catch (e) {
    console.warn('Failed to load episodes.json', e);
    return [];
  }
}

/* ---------- session helpers ---------- */
function firstIncompleteEpisodeId(episodes, session) {
  const seen = session?.episodes || {};
  for (const ep of episodes) {
    const epState = seen[ep.id];
    // If never started or (exists but has no beats marked), treat as incomplete
    if (!epState || !epState.beats || Object.keys(epState.beats).length === 0) {
      return ep.id;
    }
  }
  // everything done? loop back to the first
  return episodes[0]?.id || 'ep1';
}

/* ---------- renderers ---------- */
function renderChapters(episodes) {
  const list = qs('#chapter-list');
  if (!list) return;

  list.innerHTML = '';
  episodes.forEach((ep) => {
    const li = document.createElement('li');
    li.className = 'list-row';
    li.innerHTML = `
      <span>${ep.title || ep.id.toUpperCase()}</span>
      <span class="muted">${fmtMin(ep.durationMin || 6)}</span>
    `;
    li.addEventListener('click', () => {
      location.href = `./episode.html?ep=${ep.id}`;
    });
    list.appendChild(li);
  });
}

function wireSearch(episodes) {
  const input = qs('#episode-search');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    const rows = qsa('#chapter-list .list-row');
    rows.forEach((row, idx) => {
      const ep = episodes[idx];
      const hit =
        !q ||
        ep.title?.toLowerCase().includes(q) ||
        ep.id.toLowerCase().includes(q);
      row.style.display = hit ? '' : 'none';
    });
  });
}

function wireContinue(episodes) {
  const btn = qs('#continue-session');
  if (!btn) return;

  const session = getSession();
  const targetEp = firstIncompleteEpisodeId(episodes, session);

  btn.addEventListener('click', () => {
    location.href = `./episode.html?ep=${targetEp}`;
  });

  // Optional “Start from Ep1” link if present
  const start = qs('#start-from-ep1');
  if (start) {
    start.addEventListener('click', (e) => {
      e.preventDefault();
      location.href = `./episode.html?ep=ep1`;
    });
  }
}

function wireNextHotkey() {
  // Press "N" to activate the next-step link/button if the page provides one
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'n') {
      const next = qs('[data-next], a.next-primary, button.next-primary');
      if (next) {
        if (next.tagName === 'A') next.click();
        else next.dispatchEvent(new Event('click', { bubbles: true }));
      }
    }
  });
}

function wireEventsPage() {
  // Lightweight behavior: “Remind me” buttons just confirm for now
  qsa('[data-remind]').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.disabled = true;
      btn.textContent = 'Reminder set ✓';
    });
  });
}

/* ---------- bootstrap ---------- */
async function init() {
  initDefaultState();
  registerSW();
  wireNextHotkey();

  const path = location.pathname;
  const isHome =
    path.endsWith('/') ||
    path.endsWith('/index.html') ||
    path.endsWith('/public');

  if (isHome) {
    const episodes = await loadEpisodes();
    renderChapters(episodes);
    wireSearch(episodes);
    wireContinue(episodes);
  } else if (path.endsWith('/events.html')) {
    wireEventsPage();
  }
}

document.addEventListener('DOMContentLoaded', init);

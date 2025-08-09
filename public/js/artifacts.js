import { getArtifacts } from './storage.js';

async function init() {
  const owned = new Set(getArtifacts());
  const data = await fetch('../data/artifacts.json').then((r) => r.json());
  const set = data.sets[0];
  const grid = document.getElementById('artifact-grid');
  grid.innerHTML = '';
  set.pieces.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<div class='badge'>${p.id}</div>
      <img src='${p.img}' alt='${p.name}' style='border-radius:12px;margin-top:8px;opacity:${
      owned.has(p.id) ? 1 : 0.3
    }' />
      <div style='margin-top:8px;font-weight:600'>${p.name}</div>
      <div style='color:#6b7280;font-size:14px;'>${
        owned.has(p.id) ? 'Unlocked' : 'Locked'
      }</div>`;
    grid.appendChild(card);
  });
  const all = set.pieces.every((p) => owned.has(p.id));
  const assemble = document.getElementById('assemble');
  if (all) {
    assemble.classList.remove('visually-hidden');
    assemble.onclick = () => {
      alert('🎉 Case File assembled! (export coming later)');
    };
  }
}
document.addEventListener('DOMContentLoaded', init);

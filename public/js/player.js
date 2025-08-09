import { markEpisodeStarted } from './storage.js';

async function init() {
  const epId = new URLSearchParams(location.search).get('ep') || 'ep1';
  const data = await fetch('../data/episodes.json').then((r) => r.json());
  const ep = data.episodes.find((e) => e.id === epId) || data.episodes[0];

  document.getElementById('ep-title').textContent = ep.title;
  document.getElementById('ep-duration').textContent = `${ep.durationMin} min`;
  const playerDiv = document.getElementById('player');
  playerDiv.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${ep.videoId}?rel=0&modestbranding=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

  markEpisodeStarted(epId);

  const beatId = `b${epId.replace('ep', '')}`;
  const nextUrl = `./beat.html?ep=${epId}&beat=${beatId}`;
  document.querySelectorAll('[data-next]').forEach((el) => {
    el.href = nextUrl;
    el.dataset.next = nextUrl;
  });
}
document.addEventListener('DOMContentLoaded', init);

import { markBeatComplete } from './storage.js';

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}
async function init() {
  const epId = getParam('ep');
  const beatId = getParam('beat');
  const data = await fetch('../data/beats.json').then((r) => r.json());
  const beat = data.beats.find((b) => b.id === beatId);
  const qEl = document.getElementById('beat-q');
  const choicesEl = document.getElementById('choices');
  qEl.textContent = beat.question;
  let selected = null;
  beat.choices.forEach((choice, idx) => {
    const btn = document.createElement('button');
    btn.className = 'button secondary';
    btn.textContent = choice;
    btn.addEventListener('click', () => {
      Array.from(choicesEl.children).forEach((c) => c.classList.remove('selected'));
      btn.classList.add('selected');
      selected = idx;
      document.getElementById('submit').disabled = false;
    });
    choicesEl.appendChild(btn);
  });

  // Timer (2 minutes)
  let remaining = 120;
  const timerEl = document.getElementById('timer');
  const interval = setInterval(() => {
    remaining--;
    const m = String(Math.floor(remaining / 60)).padStart(2, '0');
    const s = String(remaining % 60).padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
    if (remaining <= 0) {
      clearInterval(interval);
      submitBtn.click();
    }
  }, 1000);

  const submitBtn = document.getElementById('submit');
  submitBtn.addEventListener('click', () => {
    if (selected === null) return;
    clearInterval(interval);
    const correct = selected === beat.correctIndex;
    markBeatComplete(epId, beat.id, beat.artifactPiece);
    document.getElementById('result').textContent = correct
      ? 'Nice! +1 artifact piece'
      : 'Not quite! Try next time.';
    submitBtn.disabled = true;

    const epNumber = parseInt(epId.replace('ep', ''), 10);
    const nextUrl =
      epNumber < 6 ? `./episode.html?ep=ep${epNumber + 1}` : './inventory.html';
    document.getElementById('next-link').href = nextUrl;
    document.getElementById('next').href = nextUrl;
    document.getElementById('next-link').classList.remove('visually-hidden');
    document.getElementById('next').classList.remove('visually-hidden');
  });
}
document.addEventListener('DOMContentLoaded', init);

// Storage helpers for QuestStream
const KEY = 'qs_state_v1';
const DEFAULT = {
  createdAt: Date.now(),
  sessionBlocks: 0,
  episodes: {},
  artifacts: {},
  streakDays: 0,
  settings: { captions: true, rate: 1.0, theme: 'light' }
};

function readState() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { ...DEFAULT };
  } catch (e) {
    return { ...DEFAULT };
  }
}

function writeState(s) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch (e) {
    // ignore storage errors
  }
}

export function initDefaultState() {
  if (!localStorage.getItem(KEY)) {
    writeState({ ...DEFAULT });
  }
}

export function getSession() {
  return readState();
}

export function markEpisodeStarted(epId) {
  const s = readState();
  if (!s.episodes[epId]) {
    s.episodes[epId] = { started: true, beats: {}, watchedMin: 0 };
    writeState(s);
  }
}

export function markBeatComplete(epId, beatId, artifactPiece) {
  const s = readState();
  if (!s.episodes[epId]) {
    s.episodes[epId] = { started: true, beats: {}, watchedMin: 0 };
  }
  s.episodes[epId].beats[beatId] = { status: 'done', ts: Date.now() };
  if (artifactPiece) {
    s.artifacts[artifactPiece] = { owned: true, ts: Date.now() };
  }
  s.sessionBlocks = Math.min(10, (s.sessionBlocks || 0) + 1);
  writeState(s);
}

export function getArtifacts() {
  const s = readState();
  return Object.keys(s.artifacts || {});
}

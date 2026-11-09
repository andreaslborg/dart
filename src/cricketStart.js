// Starting, storing and resuming Cricket games.
//
// Cricket is picked as a game type in the normal setups (scoreboard "Ny kamp",
// Spil mod AI, Lokalt mod venner). Those setups call startCricket(), which writes
// the new game and opens the Cricket screen. Local and AI games live in this
// phone's localStorage; the online 1v1 game lives in scores/cricket so both
// phones share it.
import { getDatabase, ref as firebaseRef, set, push } from 'firebase/database';
import { TARGETS, freshStats, freshLeg } from '@/cricket';

export const STORE_KEY = 'borgdart_cricket_v1';
export const ONLINE_PATH = 'scores/cricket';

export const blankGame = () => ({
  mode: 'local', phase: 'setup', order: 'free', legsToWin: 2, legNo: 1, level: 'pub', start: 'bull',
  players: [], legs: [], marks: [], points: [], stats: [], turn: 0, firstStarter: 0,
  visit: [], prev: null, legOver: false, lastLegWinner: 0, undo: [], matchId: null, startedAt: null,
  bull: { results: [], active: [], round: 1 },
});

// Firebase drops empty arrays and nulls inside arrays: rebuild the full shape.
export function normalize(raw) {
  const g = { ...blankGame(), ...(raw || {}) };
  const n = Array.isArray(g.players) ? g.players.length : Object.keys(g.players || {}).length;
  const arr = (v, fill) => Array.from({ length: n }, (_, i) => {
    const x = v ? v[i] : undefined;
    return x === undefined || x === null ? (typeof fill === 'function' ? fill() : fill) : x;
  });
  g.players = arr(g.players, () => ({ name: '' }));
  g.legs = arr(g.legs, 0);
  g.points = arr(g.points, 0);
  g.marks = arr(g.marks, () => TARGETS.map(() => 0)).map(row => TARGETS.map((t, i) => (row && row[i]) || 0));
  g.stats = arr(g.stats, freshStats).map(s => ({ ...freshStats(), ...s }));
  g.visit = Object.values(g.visit || {});
  g.undo = Object.values(g.undo || {});
  const b = g.bull || {};
  g.bull = { round: b.round || 1, results: arr(b.results, null), active: arr(b.active, false) };
  return g;
}

// cfg: { mode: 'local'|'ai'|'online', players: [{ name, bot? }], order, legsToWin, start: 'bull'|'p0'|'p1'|..., level }
export function buildCricketGame(cfg) {
  const players = cfg.players.map(p => (p.bot ? { name: p.name, bot: p.bot } : { name: p.name }));
  const n = players.length;
  const g = {
    ...blankGame(),
    mode: cfg.mode,
    order: cfg.order || 'free',
    legsToWin: typeof cfg.legsToWin === 'number' ? cfg.legsToWin : 2, // 0 = no limit
    level: cfg.level || 'pub',
    start: cfg.start || 'bull',
    players,
    legs: players.map(() => 0),
    stats: players.map(freshStats),
    ...freshLeg(n),
    matchId: push(firebaseRef(getDatabase(), 'history/cricket')).key,
    startedAt: Date.now(),
  };
  if (g.start === 'bull') {
    g.phase = 'bull';
    g.bull = { results: players.map(() => null), active: players.map(() => true), round: 1 };
  } else {
    const s = Math.min(n - 1, Math.max(0, parseInt(String(g.start).slice(1), 10) || 0));
    g.phase = 'play';
    g.firstStarter = s;
    g.turn = s;
  }
  return g;
}

export const loadLocal = () => {
  try { const v = localStorage.getItem(STORE_KEY); return v ? JSON.parse(v) : null; } catch (e) { return null; }
};
export const saveLocal = (game) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ game })); } catch (e) { /* storage unavailable */ }
};

// The Cricket game on this phone, if one is running for the given mode.
export function runningLocal(mode) {
  const saved = loadLocal();
  const g = saved && saved.game;
  if (!g || g.phase === 'setup' || (mode && g.mode !== mode)) return null;
  return g;
}

// Where to go when a Cricket game is left or finished.
export const originOf = (mode) => ({ local: '/lokalt', ai: '/ai' }[mode] || '/');

// Set when someone backs out of a running online game, so the scoreboard
// doesn't throw them straight back in. Cleared when the game ends.
export const autoOpen = { suppressed: false };

export async function startCricket(cfg, router, query) {
  const game = buildCricketGame(cfg);
  if (cfg.mode === 'online') {
    autoOpen.suppressed = false;
    await set(firebaseRef(getDatabase(), ONLINE_PATH), JSON.parse(JSON.stringify(game)));
  } else {
    saveLocal(game);
  }
  router.push({ path: '/cricket', query: { ...(query || {}), src: cfg.mode === 'online' ? 'online' : 'local' } });
}

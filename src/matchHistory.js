// Match history helpers.
//
// Each match lives at history/matches/{id} in the Realtime Database and is
// rewritten with a fresh snapshot while it is being played, so a match is
// never lost even if nobody presses "Ny kamp".

const sum = (arr) => arr.reduce((a, b) => a + (Number(b) || 0), 0);

export const normalizeName = (name) => (name || '').trim().toLowerCase();

export function buildPlayerSnapshot({ name, legs, setScores, highestCheckout, checkouts, doubleDarts, legDarts }) {
  const visits = setScores.length;
  const scored = sum(setScores);
  return {
    name: name || '',
    legs: legs || 0,
    visits,
    scored,
    n180: setScores.filter(v => v === 180).length,
    n140: setScores.filter(v => v >= 140 && v < 180).length,
    n100: setScores.filter(v => v >= 100 && v < 140).length,
    highScore: visits > 0 ? Math.max(...setScores) : 0,
    highestCheckout: highestCheckout || 0,
    checkouts: checkouts || [],
    doubleDarts: sum(doubleDarts || []),
    legDarts: legDarts || [],
  };
}

export const average = (scored, visits) => (visits > 0 ? scored / visits : null);

export const formatNumber = (n, digits = 1) => {
  if (n === null || n === undefined || Number.isNaN(n)) return '–';
  return n % 1 === 0 ? String(n) : n.toFixed(digits);
};

export const formatPct = (hits, attempts) => (attempts > 0 ? `${Math.round((hits / attempts) * 100)}%` : '–');

export const formatDate = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Turn the raw history object into a sorted list (newest first).
export function matchList(raw) {
  if (!raw) return [];
  return Object.entries(raw)
    .map(([id, m]) => ({ id, ...m }))
    .filter(m => m.players && m.players.p1 && m.players.p2)
    .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));
}

// Every distinct player name seen in history (display name = most recent spelling).
export function playerNames(matches) {
  const seen = new Map();
  for (const m of matches) {
    for (const p of [m.players.p1, m.players.p2]) {
      const key = normalizeName(p.name);
      if (key && !seen.has(key)) seen.set(key, p.name.trim());
    }
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b, 'da'));
}

const emptyTotals = () => ({
  matches: 0, matchWins: 0, legs: 0, visits: 0, scored: 0,
  n180: 0, n140: 0, n100: 0, highScore: 0, highestCheckout: 0,
  checkouts: 0, doubleDarts: 0, bestLeg: null, legDarts: [],
});

const addTo = (t, p, wonMatch) => {
  t.matches += 1;
  t.matchWins += wonMatch ? 1 : 0;
  t.legs += p.legs || 0;
  t.visits += p.visits || 0;
  t.scored += p.scored || 0;
  t.n180 += p.n180 || 0;
  t.n140 += p.n140 || 0;
  t.n100 += p.n100 || 0;
  t.highScore = Math.max(t.highScore, p.highScore || 0);
  t.highestCheckout = Math.max(t.highestCheckout, p.highestCheckout || 0);
  t.checkouts += (p.checkouts || []).length;
  t.doubleDarts += p.doubleDarts || 0;
  for (const d of p.legDarts || []) {
    t.legDarts.push(d);
    t.bestLeg = t.bestLeg === null ? d : Math.min(t.bestLeg, d);
  }
};

// Head-to-head totals for two named players, counting only matches between them.
export function headToHead(matches, nameA, nameB) {
  const a = normalizeName(nameA);
  const b = normalizeName(nameB);
  const res = { a: emptyTotals(), b: emptyTotals(), draws: 0, matches: [] };
  if (!a || !b || a === b) return res;
  for (const m of matches) {
    const p1 = m.players.p1;
    const p2 = m.players.p2;
    const n1 = normalizeName(p1.name);
    const n2 = normalizeName(p2.name);
    let pa;
    let pb;
    if (n1 === a && n2 === b) { pa = p1; pb = p2; } else if (n1 === b && n2 === a) { pa = p2; pb = p1; } else continue;
    const la = pa.legs || 0;
    const lb = pb.legs || 0;
    if (la === lb) res.draws += 1;
    addTo(res.a, pa, la > lb);
    addTo(res.b, pb, lb > la);
    res.matches.push(m);
  }
  return res;
}

// All-time records across every match.
export function records(matches) {
  const best = {
    highestCheckout: null, bestLeg: null, bestAverage: null, most180: null, highScore: null,
  };
  const consider = (key, value, name, date, better) => {
    if (value === null || value === undefined || value === 0) return;
    if (!best[key] || better(value, best[key].value)) best[key] = { value, name: (name || '').trim(), date };
  };
  for (const m of matches) {
    // Bots from "Spil mod AI" don't count towards the records.
    const humans = m.mode === 'ai' ? [m.players.p1] : [m.players.p1, m.players.p2];
    for (const p of humans) {
      const avg = average(p.scored || 0, p.visits || 0);
      consider('highestCheckout', p.highestCheckout, p.name, m.startedAt, (x, y) => x > y);
      consider('highScore', p.highScore, p.name, m.startedAt, (x, y) => x > y);
      consider('most180', p.n180, p.name, m.startedAt, (x, y) => x > y);
      // Only count averages from matches with a meaningful number of visits.
      if ((p.visits || 0) >= 9) consider('bestAverage', avg, p.name, m.startedAt, (x, y) => x > y);
      const legBest = (p.legDarts || []).length ? Math.min(...p.legDarts) : null;
      consider('bestLeg', legBest, p.name, m.startedAt, (x, y) => x < y);
    }
  }
  return best;
}

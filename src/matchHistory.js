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

// ------------------------------------------------------------ players ----

// Every match a player took part in, oldest first, seen from that player.
export function playerMatches(matches, name) {
  const key = normalizeName(name);
  if (!key) return [];
  const out = [];
  for (const m of matches) {
    const { p1, p2 } = m.players;
    let me = null;
    let opp = null;
    if (normalizeName(p1.name) === key) { me = p1; opp = p2; } else if (normalizeName(p2.name) === key) { me = p2; opp = p1; } else continue;
    const myLegs = me.legs || 0;
    const oppLegs = opp.legs || 0;
    out.push({
      id: m.id,
      date: m.startedAt,
      mode: m.mode || 'pvp',
      level: m.level || null,
      startScore: m.startScore || 501,
      me,
      opp,
      oppName: (opp.name || '').trim(),
      myLegs,
      oppLegs,
      result: myLegs > oppLegs ? 'win' : (myLegs < oppLegs ? 'loss' : 'draw'),
      avg: average(me.scored || 0, me.visits || 0),
      checkoutPct: (me.doubleDarts || 0) > 0 ? ((me.checkouts || []).length / me.doubleDarts) * 100 : null,
    });
  }
  return out.sort((a, b) => (a.date || 0) - (b.date || 0));
}

export function playerSummary(list) {
  const s = {
    matches: list.length, wins: 0, losses: 0, draws: 0, legsWon: 0, legsLost: 0,
    visits: 0, scored: 0, n180: 0, n140: 0, n100: 0, highScore: 0, highestCheckout: 0,
    checkouts: 0, doubleDarts: 0, bestLeg: null, bestAverage: null,
  };
  for (const e of list) {
    const p = e.me;
    if (e.result === 'win') s.wins += 1;
    else if (e.result === 'loss') s.losses += 1;
    else s.draws += 1;
    s.legsWon += e.myLegs;
    s.legsLost += e.oppLegs;
    s.visits += p.visits || 0;
    s.scored += p.scored || 0;
    s.n180 += p.n180 || 0;
    s.n140 += p.n140 || 0;
    s.n100 += p.n100 || 0;
    s.highScore = Math.max(s.highScore, p.highScore || 0);
    s.highestCheckout = Math.max(s.highestCheckout, p.highestCheckout || 0);
    s.checkouts += (p.checkouts || []).length;
    s.doubleDarts += p.doubleDarts || 0;
    for (const d of p.legDarts || []) s.bestLeg = s.bestLeg === null ? d : Math.min(s.bestLeg, d);
    if ((p.visits || 0) >= 9 && e.avg !== null) s.bestAverage = s.bestAverage === null ? e.avg : Math.max(s.bestAverage, e.avg);
  }
  s.average = average(s.scored, s.visits);
  s.winPct = s.matches ? Math.round((s.wins / s.matches) * 100) : null;
  return s;
}

// ------------------------------------------------------------- badges ----

const legsAtMost = (n) => (e) => (e.me.legDarts || []).some(d => d <= n);
const tons = (p) => (p.n100 || 0) + (p.n140 || 0) + (p.n180 || 0);
const beatBot = (levels) => (e) => e.mode === 'ai' && e.result === 'win' && levels.includes(e.level);

// `test(entry, totals)` runs on each match in order; totals are running sums up to and including it.
export const BADGES = [
  { id: 'first-win', name: 'Første sejr', desc: 'Vind en kamp.', icon: 'trophy', test: (e) => e.result === 'win' },
  { id: 'wins-10', name: 'Vinderen', desc: 'Vind 10 kampe.', icon: 'trophy', test: (e, t) => t.wins >= 10, goal: (t) => [t.wins, 10] },
  { id: 'whitewash', name: 'Hvidvask', desc: 'Vind en kamp på mindst 3 legs uden at tabe et leg.', icon: 'shield', test: (e) => e.result === 'win' && e.myLegs >= 3 && e.oppLegs === 0 },
  { id: 'first-180', name: 'Første 180', desc: 'Kast 180.', icon: 'flame', test: (e) => (e.me.n180 || 0) >= 1 },
  { id: '180-club', name: '180-klubben', desc: 'Kast 180 ti gange i alt.', icon: 'flame', test: (e, t) => t.n180 >= 10, goal: (t) => [t.n180, 10] },
  { id: 'ton-machine', name: 'Ton-maskine', desc: 'Score 100+ fem gange i én kamp.', icon: 'bolt', test: (e) => tons(e.me) >= 5 },
  { id: 'avg-50', name: 'Gennemsnit 50+', desc: 'Hav et gennemsnit på 50+ i en kamp (mindst 9 runder).', icon: 'chart', test: (e) => (e.me.visits || 0) >= 9 && e.avg >= 50 },
  { id: 'avg-70', name: 'Gennemsnit 70+', desc: 'Hav et gennemsnit på 70+ i en kamp (mindst 9 runder).', icon: 'chart', test: (e) => (e.me.visits || 0) >= 9 && e.avg >= 70 },
  { id: 'ton-finish', name: 'Ton-plus finish', desc: 'Luk et leg på 100 eller mere.', icon: 'target', test: (e) => (e.me.highestCheckout || 0) >= 100 },
  { id: 'big-fish', name: 'Big Fish', desc: 'Luk på 170: T20, T20, BULL.', icon: 'target', test: (e) => (e.me.checkouts || []).includes(170) },
  { id: 'double-king', name: 'Doublekongen', desc: 'Checkout på 50 % eller mere i en kamp med mindst 3 checkouts.', icon: 'crown', test: (e) => (e.me.checkouts || []).length >= 3 && e.checkoutPct >= 50 },
  { id: 'leg-18', name: 'Hurtigt leg', desc: 'Vind et leg på 18 darts eller færre.', icon: 'clock', test: legsAtMost(18) },
  { id: 'leg-12', name: 'Lynleg', desc: 'Vind et leg på 12 darts eller færre.', icon: 'clock', test: legsAtMost(12) },
  { id: 'nine-darter', name: '9-darter', desc: 'Vind et leg på 9 darts. Det perfekte leg.', icon: 'star', test: legsAtMost(9) },
  { id: 'beat-bot', name: 'Slå botten', desc: 'Vind over en bot i Spil mod AI.', icon: 'bot', test: beatBot(['begynder', 'pub', 'liga', 'pro']) },
  { id: 'beat-liga', name: 'Ligaspiller', desc: 'Vind over Liga-botten.', icon: 'bot', test: beatBot(['liga', 'pro']) },
  { id: 'beat-pro', name: 'Pro-dræber', desc: 'Vind over Pro-botten.', icon: 'bot', test: beatBot(['pro']) },
  { id: 'bot-sweep', name: 'Bot-sweep', desc: 'Vind over alle fire bots: Begynder, Pub, Liga og Pro.', icon: 'bot', test: (e, t) => t.botsBeaten.size >= 4, goal: (t) => [t.botsBeaten.size, 4] },
  { id: 'streak-3', name: 'Sejrsstime', desc: 'Vind 3 kampe i træk.', icon: 'bolt', test: (e, t) => t.streak >= 3, goal: (t) => [t.bestStreak, 3] },
  { id: 'streak-5', name: 'Uovervindelig', desc: 'Vind 5 kampe i træk.', icon: 'bolt', test: (e, t) => t.streak >= 5, goal: (t) => [t.bestStreak, 5] },
  { id: 'matches-25', name: 'Stamgæst', desc: 'Spil 25 kampe.', icon: 'calendar', test: (e, t) => t.matches >= 25, goal: (t) => [t.matches, 25] },
  { id: 'matches-100', name: 'Veteran', desc: 'Spil 100 kampe.', icon: 'calendar', test: (e, t) => t.matches >= 100, goal: (t) => [t.matches, 100] },
  { id: 'max-3', name: 'Maksimum-maskinen', desc: 'Kast 180 tre gange i én kamp.', icon: 'flame', test: (e) => (e.me.n180 || 0) >= 3 },
  { id: 'tons-50', name: 'Ton-samler', desc: 'Score 100+ i 50 runder i alt.', icon: 'bolt', test: (e, t) => t.tons >= 50, goal: (t) => [t.tons, 50] },
  { id: 'avg-90', name: 'Gennemsnit 90+', desc: 'Hav et gennemsnit på 90+ i en kamp (mindst 9 runder).', icon: 'chart', test: (e) => (e.me.visits || 0) >= 9 && e.avg >= 90 },
  { id: 'bull-finish', name: 'Bullseye-finish', desc: 'Luk et leg på præcis 50.', icon: 'target', test: (e) => (e.me.checkouts || []).includes(50) },
  { id: 'finish-120', name: 'Fantastisk finish', desc: 'Luk et leg på 120 eller mere.', icon: 'target', test: (e) => (e.me.highestCheckout || 0) >= 120 },
  { id: 'closer-25', name: 'Lukkeren', desc: 'Luk 25 legs i alt.', icon: 'medal', test: (e, t) => t.checkouts >= 25, goal: (t) => [t.checkouts, 25] },
  { id: 'sharpshooter', name: 'Skarpskytte', desc: '100 % checkout i en kamp med mindst 2 checkouts.', icon: 'crown', test: (e) => (e.me.checkouts || []).length >= 2 && e.checkoutPct >= 100 },
  { id: 'marathon', name: 'Maraton', desc: 'Vind en kamp i 1000.', icon: 'medal', test: (e) => e.result === 'win' && e.startScore === 1000 },
  { id: 'sprinter', name: 'Sprinter', desc: 'Vind en kamp i 201.', icon: 'clock', test: (e) => e.result === 'win' && e.startScore === 201 },
];

// Which badges a player has, and when each was first earned. `list` is from playerMatches().
export function computeBadges(list) {
  const totals = {
    wins: 0, n180: 0, matches: 0, streak: 0, bestStreak: 0, tons: 0, checkouts: 0, botsBeaten: new Set(),
  };
  const earned = {};
  for (const e of list) {
    totals.matches += 1;
    if (e.result === 'win') {
      totals.wins += 1;
      totals.streak += 1;
      totals.bestStreak = Math.max(totals.bestStreak, totals.streak);
      if (e.mode === 'ai' && e.level) totals.botsBeaten.add(e.level);
    } else {
      totals.streak = 0;
    }
    totals.n180 += e.me.n180 || 0;
    totals.tons += tons(e.me);
    totals.checkouts += (e.me.checkouts || []).length;
    for (const b of BADGES) {
      if (!earned[b.id] && b.test(e, totals)) earned[b.id] = e.date || true;
    }
  }
  return BADGES.map(b => {
    const progress = b.goal ? b.goal(totals) : null;
    return {
      id: b.id, name: b.name, desc: b.desc, icon: b.icon,
      earned: Boolean(earned[b.id]),
      date: typeof earned[b.id] === 'number' ? earned[b.id] : null,
      progress: progress && !earned[b.id] ? { have: Math.min(progress[0], progress[1]), need: progress[1] } : null,
    };
  });
}

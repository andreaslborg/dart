// Cut-throat Cricket.
//
// Numbers 20-15 and the bull. Three marks close a number (single = 1, double = 2,
// triple = 3; outer bull = 1, bullseye = 2). Once you have closed a number, every
// further hit on it gives its points to each opponent who has NOT closed it.
// When everyone has closed a number it is dead. You win the leg the moment you
// have closed everything and have the lowest score (ties count as lowest).
//
// Order: 'free' (any order) or 'strict' (20, 19, 18, 17, 16, 15, bull: you can
// only start on the next number once the previous one is closed).

export const TARGETS = [20, 19, 18, 17, 16, 15, 25];
export const targetName = (t) => (t === 25 ? 'BULL' : String(t));
export const dartLabel = (d) => {
  if (!d || !d.t) return '–';
  if (d.t === 25) return d.m === 2 ? 'BULL' : '25';
  return `${d.m === 3 ? 'T' : d.m === 2 ? 'D' : ''}${d.t}`;
};

export const freshStats = () => ({ darts: 0, marks: 0, visits: 0, triples: 0, given: 0, closes: 0 });

// A new leg for n players.
export function freshLeg(n) {
  return {
    marks: Array.from({ length: n }, () => TARGETS.map(() => 0)),
    points: Array.from({ length: n }, () => 0),
  };
}

const idx = (t) => TARGETS.indexOf(t);
export const isClosed = (marks, p, t) => marks[p][idx(t)] >= 3;
export const deadFor = (marks, t) => marks.every((m, p) => isClosed(marks, p, t));

// The number a player must aim for next in strict order (null when all are closed).
export function nextStrict(marks, p) {
  const i = marks[p].findIndex(v => v < 3);
  return i === -1 ? null : TARGETS[i];
}

// Can player p hit target t for any effect right now?
export function targetAllowed(state, p, t) {
  if (!t) return true; // a miss is always allowed
  if (deadFor(state.marks, t)) return false;
  if (state.order !== 'strict') return true;
  // Strict: closed numbers keep scoring, otherwise only the next one counts.
  return isClosed(state.marks, p, t) || nextStrict(state.marks, p) === t;
}

// Apply one dart for player p. Returns a description of what happened.
// Mutates state.marks and state.points.
export function applyDart(state, p, t, m) {
  const res = { t, m, marked: 0, gave: 0, closed: false, to: [] };
  if (!t || !m || !targetAllowed(state, p, t)) return res;
  const i = idx(t);
  const before = state.marks[p][i];
  const need = Math.max(0, 3 - before);
  const toClose = Math.min(need, m);
  const extra = m - toClose;
  state.marks[p][i] = Math.min(3, before + toClose);
  res.marked = toClose;
  if (before < 3 && state.marks[p][i] >= 3) res.closed = true;
  if (extra > 0) {
    const value = t === 25 ? 25 : t;
    state.marks.forEach((row, q) => {
      if (q !== p && row[i] < 3) {
        state.points[q] += extra * value;
        res.gave += extra * value;
        res.to.push(q);
      }
    });
    if (res.to.length) res.marked += extra;
  }
  return res;
}

export const allClosed = (marks, p) => marks[p].every(v => v >= 3);

// Has player p won the leg? All closed and lowest (or equal lowest) points.
export function legWinner(state) {
  for (let p = 0; p < state.marks.length; p++) {
    if (allClosed(state.marks, p) && state.points[p] <= Math.min(...state.points)) return p;
  }
  return -1;
}

// Standing: 1 = best. Lowest points first, then most marks.
export function standing(state) {
  const n = state.points.length;
  const marks = (p) => state.marks[p].reduce((a, b) => a + Math.min(3, b), 0);
  const order = Array.from({ length: n }, (_, i) => i)
    .sort((a, b) => (state.points[a] - state.points[b]) || (marks(b) - marks(a)));
  const rank = new Array(n);
  order.forEach((p, pos) => {
    const prev = order[pos - 1];
    rank[p] = pos > 0 && state.points[prev] === state.points[p] && marks(prev) === marks(p) ? rank[prev] : pos + 1;
  });
  return rank;
}

export const mpr = (st) => (st && st.visits ? (st.marks / st.visits) : null);
export const fmtMpr = (st) => {
  const v = mpr(st);
  return v === null ? '–' : v.toFixed(2);
};

// ------------------------------------------------------------------ bot ---

// The X01 levels are calibrated for scoring; in Cricket nearly any dart in the
// right segment counts, so the spread is widened per level to give realistic
// marks per round: Begynder ~0.9, Pub ~1.6, Liga ~2.4, Pro ~3.4 (simulated).
const CRICKET_SCALE = { begynder: 2.0, pub: 1.55, liga: 1.4, pro: 1.6 };
export function cricketLevel(level) {
  const k = CRICKET_SCALE[level.key] || 1.5;
  return { ...level, sigma: level.sigma * k, badSigma: level.badSigma * k };
}

// Which target should the bot aim its next dart at?
// Returns { t, ring } where ring is one of 'T', 'S', 'SB' (bull aim).
export function botTarget(state, p) {
  const { marks, points } = state;
  const others = marks.map((_, q) => q).filter(q => q !== p);
  const minOther = Math.min(...others.map(q => points[q]));
  const aim = (t) => (t === 25 ? { t, ring: 'SB' } : { t, ring: 'T' });

  if (state.order === 'strict') {
    const next = nextStrict(marks, p);
    // Behind on points with a scoring number: hurt the leader first.
    if (points[p] > minOther || next === null) {
      const scoring = TARGETS.filter(t => isClosed(marks, p, t) && !deadFor(marks, t));
      const best = pickScoring(state, p, scoring);
      if (best) return aim(best);
    }
    return next === null ? aim(20) : aim(next);
  }

  const open = TARGETS.filter(t => !isClosed(marks, p, t) && !deadFor(marks, t));
  const scoring = TARGETS.filter(t => isClosed(marks, p, t) && !deadFor(marks, t));

  // 1. Behind (more points than the leader) and able to hand out points: do it.
  if (points[p] > minOther && scoring.length) {
    const best = pickScoring(state, p, scoring);
    if (best) return aim(best);
  }
  // 2. Close the numbers others can already punish us on, biggest first.
  const threats = open.filter(t => others.some(q => isClosed(marks, q, t)));
  if (threats.length) return aim(Math.max(...threats.filter(t => t !== 25), 0) || threats[0]);
  // 3. Otherwise close the biggest open number (bull last).
  const nums = open.filter(t => t !== 25);
  if (nums.length) return aim(Math.max(...nums));
  if (open.length) return aim(25);
  // Everything closed but not winning: give points.
  const best = pickScoring(state, p, scoring);
  return aim(best || 20);
}

// Best number to score on: most points to the current leader (lowest score).
function pickScoring(state, p, scoring) {
  const { marks, points } = state;
  const others = marks.map((_, q) => q).filter(q => q !== p);
  const leaderPts = Math.min(...others.map(q => points[q]));
  const leaders = others.filter(q => points[q] === leaderPts);
  let best = null;
  let bestVal = -1;
  scoring.forEach((t) => {
    const hitsLeader = leaders.some(q => !isClosed(marks, q, t));
    if (!hitsLeader) return;
    const v = t === 25 ? 20 : t; // bull is harder to hit; treat it as ~20
    if (v > bestVal) { bestVal = v; best = t; }
  });
  return best;
}

// Map a simulated dart (dartBot.throwDart result) to a cricket hit.
export function dartToCricket(dart) {
  if (dart.ring === 'DB') return { t: 25, m: 2 };
  if (dart.ring === 'SB') return { t: 25, m: 1 };
  if (!TARGETS.includes(dart.n)) return { t: 0, m: 0 };
  const m = dart.ring === 'T' ? 3 : dart.ring === 'D' ? 2 : dart.ring === 'S' ? 1 : 0;
  return m ? { t: dart.n, m } : { t: 0, m: 0 };
}

// Dart bot: simulates every dart on a real dartboard.
//
// Each dart aims at a point on the board and lands at that point plus a random
// Gaussian offset. The spread (sigma, in mm) sets the skill level. On top of
// that every level has a share of "bad darts": a small chance that a dart is
// thrown with a much bigger spread, so even the pro occasionally sprays one.

// ---------------------------------------------------------------- board ----

// Standard board dimensions in mm (radius from centre).
const R_BULL = 6.35;
const R_OUTER_BULL = 15.9;
const R_TREBLE_IN = 99;
const R_TREBLE_OUT = 107;
const R_DOUBLE_IN = 162;
const R_DOUBLE_OUT = 170;

// Clockwise from the top.
export const SEGMENTS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

const segmentAngle = (n) => {
  // Angle (degrees, maths convention: 0 = right, 90 = up) of a number's centre.
  const i = SEGMENTS.indexOf(n);
  return 90 - i * 18;
};

// Where to aim for a target like {ring: 'T', n: 20}.
function aimPoint(target) {
  if (target.ring === 'DB' || target.ring === 'SB') return { x: 0, y: 0 };
  const r = {
    T: (R_TREBLE_IN + R_TREBLE_OUT) / 2,
    D: (R_DOUBLE_IN + R_DOUBLE_OUT) / 2,
    S: (R_TREBLE_OUT + R_DOUBLE_IN) / 2, // the big outer single
  }[target.ring];
  const a = (segmentAngle(target.n) * Math.PI) / 180;
  return { x: r * Math.cos(a), y: r * Math.sin(a) };
}

// What a dart landing at (x, y) scores.
export function scoreAt(x, y) {
  const r = Math.hypot(x, y);
  if (r <= R_BULL) return { ring: 'DB', n: 25, value: 50, double: true, label: 'BULL' };
  if (r <= R_OUTER_BULL) return { ring: 'SB', n: 25, value: 25, double: false, label: '25' };
  if (r > R_DOUBLE_OUT) return { ring: 'MISS', n: 0, value: 0, double: false, label: 'MISS' };
  const deg = (Math.atan2(y, x) * 180) / Math.PI; // -180..180, 90 = top
  const fromTop = ((90 - deg + 9) % 360 + 360) % 360; // clockwise from top, shifted half a segment
  const n = SEGMENTS[Math.floor(fromTop / 18)];
  if (r >= R_DOUBLE_IN) return { ring: 'D', n, value: n * 2, double: true, label: `D${n}` };
  if (r >= R_TREBLE_IN && r <= R_TREBLE_OUT) return { ring: 'T', n, value: n * 3, double: false, label: `T${n}` };
  return { ring: 'S', n, value: n, double: false, label: `${n}` };
}

// ---------------------------------------------------------------- levels ---

// sigma: normal spread in mm. doubleFactor: extra spread when aiming at a double.
// badRate: share of darts thrown badly. badSigma: spread of a bad dart. Calibrated by simulation (see scripts/calibrate).
export const LEVELS = {
  begynder: { key: 'begynder', name: 'Begynder', sigma: 19.5, doubleFactor: 2.2, badRate: 0.15, badSigma: 90, target: 27 },
  pub: { key: 'pub', name: 'Pub', sigma: 14.5, doubleFactor: 2.2, badRate: 0.12, badSigma: 65, target: 40 },
  liga: { key: 'liga', name: 'Liga', sigma: 11, doubleFactor: 2.0, badRate: 0.09, badSigma: 50, target: 55 },
  pro: { key: 'pro', name: 'Pro', sigma: 6.8, doubleFactor: 1.7, badRate: 0.06, badSigma: 35, target: 85 },
};

// Box-Muller standard normal.
function gauss(rand) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function throwDart(target, level, rand = Math.random) {
  const aim = aimPoint(target);
  const bad = rand() < level.badRate;
  let s = bad ? level.badSigma : level.sigma;
  // Doubles (and the bull) are much harder under pressure: extra spread.
  if (target.ring === 'D' || target.ring === 'DB') s *= level.doubleFactor || 1;
  const x = aim.x + gauss(rand) * s;
  const y = aim.y + gauss(rand) * s;
  const hit = scoreAt(x, y);
  return { ...hit, aimed: target, bad, x, y, dist: Math.hypot(x, y) };
}

// -------------------------------------------------------------- strategy ---

const T = (n) => ({ ring: 'T', n, value: 3 * n });
const D = (n) => ({ ring: n === 25 ? 'DB' : 'D', n, value: 2 * n });
const S = (n) => ({ ring: n === 25 ? 'SB' : 'S', n, value: n });

export const targetLabel = (t) => {
  if (t.ring === 'DB') return 'BULL';
  if (t.ring === 'SB') return '25';
  return t.ring === 'S' ? `${t.n}` : `${t.ring}${t.n}`;
};

// Doubles players like to be left on, best first.
const DOUBLE_PREF = [32, 40, 16, 24, 36, 20, 8, 12, 28, 4, 18, 26, 30, 34, 38, 22, 10, 14, 6, 2, 50];
const doubleRank = (v) => {
  const i = DOUBLE_PREF.indexOf(v);
  return i === -1 ? 99 : i;
};
const isDoubleFinish = (r) => r === 50 || (r >= 2 && r <= 40 && r % 2 === 0);

// Setup darts, in order of preference: big singles before trebles (safer).
const SETUP_DARTS = [
  ...[20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(S),
  S(25),
  ...[20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(T),
  D(25),
];
const BIG_DARTS = [T(20), T(19), T(18), T(17), T(16), T(15), T(14), T(13), D(25), S(25)];

// How much a player dislikes throwing at a target on the way to a finish.
const dartPenalty = (t) => {
  if (t.ring === 'DB') return 12;
  if (t.ring === 'SB') return 6;
  if (t.ring === 'T') return t.n >= 19 ? 1 : (t.n >= 16 ? 3 : 5);
  return 0;
};

// Best route to finish `r` with `darts` darts, or null. Returns the list of targets.
function finishRoute(r, darts) {
  if (darts < 1 || r < 2) return null;
  if (isDoubleFinish(r)) return [D(r === 50 ? 25 : r / 2)];
  if (darts === 1) return null;
  let best = null;
  let bestScore = Infinity;
  const candidates = r > 60 ? BIG_DARTS : SETUP_DARTS;
  for (const t of candidates) {
    const rest = r - t.value;
    if (rest < 2) continue;
    const route = finishRoute(rest, darts - 1);
    if (!route) continue;
    // Prefer fewer darts, then a nice double, then a single over a treble.
    const last = route[route.length - 1].value;
    const score = route.length * 100 + doubleRank(last) + dartPenalty(t);
    if (score < bestScore) {
      bestScore = score;
      best = [t, ...route];
    }
  }
  return best;
}

// Which target to throw the next dart at.
export function chooseTarget(remaining, dartsLeft) {
  const route = finishRoute(remaining, dartsLeft);
  if (route) return route[0];

  // No finish this visit: score, or set up a good double for next time.
  if (remaining > 100) {
    // Avoid leaving a bogey number with a treble 20 if possible.
    for (const t of [T(20), T(19), T(18)]) {
      const rest = remaining - t.value;
      if (rest >= 2 && finishRoute(rest, 3)) return t;
      if (rest > 170) return t;
    }
    return T(20);
  }
  // Leave a preferred double with a single if we can.
  let best = null;
  let bestRank = Infinity;
  for (const t of SETUP_DARTS) {
    const rest = remaining - t.value;
    if (rest < 2) continue;
    const rank = isDoubleFinish(rest) ? doubleRank(rest) : (finishRoute(rest, 2) ? 50 : 200);
    if (rank < bestRank) {
      bestRank = rank;
      best = t;
    }
  }
  return best || S(20);
}

// ---------------------------------------------------------------- visit ----

// Play one full visit (up to three darts) with double-out rules.
// Returns { darts, scored, remaining, bust, checkout, doubleDarts }.
export function playVisit(startRemaining, level, rand = Math.random) {
  let remaining = startRemaining;
  const darts = [];
  let doubleDarts = 0;
  for (let i = 0; i < 3; i++) {
    const target = chooseTarget(remaining, 3 - i);
    if (isDoubleFinish(remaining) && (target.ring === 'D' || target.ring === 'DB')) doubleDarts += 1;
    const dart = throwDart(target, level, rand);
    darts.push(dart);
    const next = remaining - dart.value;
    if (next === 0 && dart.double) {
      return { darts, scored: startRemaining, remaining: 0, bust: false, checkout: true, doubleDarts };
    }
    if (next < 2) {
      return { darts, scored: 0, remaining: startRemaining, bust: true, checkout: false, doubleDarts };
    }
    remaining = next;
  }
  return { darts, scored: startRemaining - remaining, remaining, bust: false, checkout: false, doubleDarts };
}

// Double-out check for a visit total entered by a human. Returns 'ok', 'bust' or 'checkout'.
export function humanVisitResult(remaining, scored) {
  const next = remaining - scored;
  if (next === 0) return 'checkout';
  if (next < 2) return 'bust';
  return 'ok';
}

// One dart at the bull for "bull om start" (normal spread, no double pressure).
export function throwBull(level, rand = Math.random) {
  return throwDart({ ring: 'SB', n: 25, value: 25 }, level, rand);
}

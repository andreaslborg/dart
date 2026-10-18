// Bulls up: each player throws one dart at the bull; the better result starts.
// Results are 'bull', '25' or 'out'.

export const BULL_RANK = { bull: 2, 25: 1, out: 0 };
export const BULL_LABEL = { bull: 'Bull', 25: '25', out: 'Udenfor' };

// Returns { status: 'waiting' | 'winner' | 'rethrow', winner?: 0 | 1 }.
// Only a clear difference decides it (bull beats 25 beats outside);
// any tie, including both outside, means both throw again.
export function resolveBull(a, b) {
  if (!a || !b) return { status: 'waiting' };
  if (a !== b) return { status: 'winner', winner: BULL_RANK[a] > BULL_RANK[b] ? 0 : 1 };
  return { status: 'rethrow' };
}

// Map a simulated dart (from dartBot.throwDart) to a bulls-up result.
export const dartToBull = (dart) => {
  if (dart.ring === 'DB') return 'bull';
  if (dart.ring === 'SB') return '25';
  return 'out';
};

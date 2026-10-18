// Bulls up: each player throws one dart at the bull; closest starts.
// Results are 'bull', '25' or 'out'.

export const BULL_RANK = { bull: 2, 25: 1, out: 0 };
export const BULL_LABEL = { bull: 'Bull', 25: '25', out: 'Udenfor' };

// Returns { status: 'waiting' | 'winner' | 'rethrow' | 'closest', winner?: 0 | 1 }.
export function resolveBull(a, b, closestWinner = null) {
  if (!a || !b) return { status: 'waiting' };
  if (a !== b) return { status: 'winner', winner: BULL_RANK[a] > BULL_RANK[b] ? 0 : 1 };
  if (a === 'out') {
    if (closestWinner === 0 || closestWinner === 1) return { status: 'winner', winner: closestWinner };
    return { status: 'closest' };
  }
  return { status: 'rethrow' };
}

// Map a simulated dart (from dartBot.throwDart) to a bulls-up result.
export const dartToBull = (dart) => {
  if (dart.ring === 'DB') return 'bull';
  if (dart.ring === 'SB') return '25';
  return 'out';
};

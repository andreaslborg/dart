// Game logic for "Lokalt mod venner": 2-4 players on one phone, optionally 2 vs 2.
//
// A "side" is whoever owns a score: one player, or a team of two. Sides take
// turns; inside a team the two players alternate. The starting side rotates
// every leg, and so does which team member throws first.

import { BULL_RANK } from '@/bullsUp';

export const SIDE_COLORS = ['var(--p1)', 'var(--p2)', 'var(--p3)', 'var(--p4)'];

// Build the sides from the player list. With teams: players 1+2 vs 3+4.
export function makeSides(players, teams) {
  if (teams && players.length === 4) {
    return [
      { name: `${players[0].name} & ${players[1].name}`, members: [0, 1], color: SIDE_COLORS[0] },
      { name: `${players[2].name} & ${players[3].name}`, members: [2, 3], color: SIDE_COLORS[1] },
    ];
  }
  return players.map((p, i) => ({ name: p.name, members: [i], color: SIDE_COLORS[i] }));
}

export const sideStarterForLeg = (firstStarter, legNo, nSides) => (firstStarter + legNo - 1) % nSides;

// Which player of a side throws now.
export const throwerOf = (side, throwsThisLeg, legNo) => side.members[(throwsThisLeg + legNo - 1) % side.members.length];

// Live standing: most legs first, then lowest remaining. Ties share a rank.
export function standings(legs, remaining) {
  const order = legs.map((l, i) => i).sort((a, b) => (legs[b] - legs[a]) || (remaining[a] - remaining[b]));
  const rank = new Array(legs.length);
  order.forEach((s, pos) => {
    const prev = order[pos - 1];
    rank[s] = pos > 0 && legs[prev] === legs[s] && remaining[prev] === remaining[s] ? rank[prev] : pos + 1;
  });
  return rank;
}

// Bulls up with any number of sides. `results[i]` is 'bull' | '25' | 'out' | null,
// `active[i]` whether side i throws this round. Returns
// { status: 'waiting' } | { status: 'winner', winner } | { status: 'rethrow', tied: [...] }.
export function resolveBullMulti(results, active) {
  const throwing = active.map((a, i) => (a ? i : -1)).filter(i => i >= 0);
  if (throwing.some(i => !results[i])) return { status: 'waiting' };
  const best = Math.max(...throwing.map(i => BULL_RANK[results[i]]));
  const top = throwing.filter(i => BULL_RANK[results[i]] === best);
  if (top.length === 1) return { status: 'winner', winner: top[0] };
  return { status: 'rethrow', tied: top };
}

// "Andreas" -> "Andreas' tur", "Bo" -> "Bos tur".
export const turnLabel = (name) => `${name}${/[sxz]$/i.test(name) ? "'" : 's'} tur`;

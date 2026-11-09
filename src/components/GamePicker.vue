<template>
  <div class="game-picker">
    <div class="gp-scores" role="group" aria-label="X01">
      <button
        v-for="s in scores" :key="'s' + s" type="button"
        :class="{ selected: game === 'x01' && score === s }"
        :aria-pressed="game === 'x01' && score === s ? 'true' : 'false'"
        @click="pickScore(s)"
      >{{ s }}</button>
    </div>

    <span class="gp-label">ANDRE SPIL</span>
    <div class="gp-modes">
      <button
        v-for="m in modes" :key="m.key" type="button" class="gp-mode" :class="{ selected: game === m.key }"
        :aria-pressed="game === m.key ? 'true' : 'false'"
        @click="$emit('update:game', m.key)"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /><circle v-if="m.key === 'cricket'" cx="12" cy="12" r="9" /><path v-else d="M3 12h3M18 12h3" /></svg>
        <span class="gp-text">
          <span class="gp-name">{{ m.name }}</span>
          <span class="gp-desc">{{ m.desc }}</span>
        </span>
      </button>
    </div>

    <div v-if="game !== 'x01'" class="gp-sub">
      <span class="gp-label">RÆKKEFØLGE</span>
      <div class="gp-scores two" role="group" aria-label="Rækkefølge">
        <button type="button" :class="{ selected: order !== 'strict' }" @click="$emit('update:order', 'free')">Fri</button>
        <button type="button" :class="{ selected: order === 'strict' }" @click="$emit('update:order', 'strict')">20 → 15 → Bull</button>
      </div>
    </div>
  </div>
</template>

<script>
// Pick the game: an X01 start score, or another game type ('cricket' = normal, 'cutthroat').
export default {
  name: 'GamePicker',
  props: {
    game: { type: String, default: 'x01' },
    score: { type: Number, default: 501 },
    order: { type: String, default: 'free' },
    scores: { type: Array, default: () => [201, 301, 501, 701, 1000] },
  },
  emits: ['update:game', 'update:score', 'update:order'],
  setup(props, { emit }) {
    const pickScore = (s) => {
      emit('update:score', s);
      emit('update:game', 'x01');
    };
    const modes = [
      { key: 'cricket', name: 'Cricket', desc: 'Luk 20–15 og bull, scor point selv' },
      { key: 'cutthroat', name: 'Cut-throat Cricket', desc: 'Giv point til de andre, færrest vinder' },
    ];
    return { pickScore, modes };
  },
};
</script>

<style scoped>
.game-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-self: stretch;
  text-align: left;
}

.gp-scores {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 4px;
  background: var(--gp-bg, var(--surface));
  border-radius: 12px;
  padding: 4px;
}

.gp-scores button {
  height: 44px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--muted);
  font-family: var(--display);
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 6px;
  cursor: pointer;
}

.gp-scores button:hover {
  color: var(--text);
}

.gp-scores button.selected {
  background: var(--accent);
  color: var(--on-accent);
}

.gp-label {
  margin-top: 4px;
  font-family: var(--display);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.14em;
  color: var(--muted);
}

.gp-modes {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gp-mode {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--gp-bg, var(--surface));
  color: var(--muted);
  text-align: left;
  cursor: pointer;
  font: inherit;
}

.gp-mode.selected {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent);
  color: var(--accent);
}

.gp-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.gp-name {
  font-family: var(--display);
  font-weight: 800;
  font-size: 19px;
  text-transform: uppercase;
  color: var(--text);
}

.gp-desc {
  font-size: 13px;
  color: var(--muted);
}

.gp-sub {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>

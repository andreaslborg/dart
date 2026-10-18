<template>
  <div class="bull-backdrop">
    <div class="bull" role="dialog" aria-modal="true" aria-labelledby="bull-title">
      <div class="bull-head">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg>
        <div>
          <h2 id="bull-title" class="bull-title">Bull om start</h2>
          <p class="bull-round">Runde {{ round }}</p>
        </div>
      </div>

      <div v-for="i in [0, 1]" :key="i" class="bull-row">
        <span class="bull-name">{{ names[i] }}</span>
        <div v-if="!results[i] && editable[i] && res.status === 'waiting'" class="bull-options" role="group" :aria-label="`Hvor ramte ${names[i]}?`">
          <button v-for="opt in options" :key="opt" type="button" @click="$emit('set', i, opt)">{{ labels[opt] }}</button>
        </div>
        <span v-else-if="results[i]" class="bull-result" :class="'r-' + results[i]">{{ labels[results[i]] }}</span>
        <span v-else class="bull-waiting">{{ thinking[i] ? 'Kaster …' : 'Venter …' }}</span>
      </div>
      <p v-if="note" class="bull-note">{{ note }}</p>

      <div class="bull-status" aria-live="polite">
        <template v-if="res.status === 'waiting'">
          <p>Kast hver én pil mod bull, og tryk hvor den landede.</p>
        </template>
        <template v-else-if="res.status === 'rethrow'">
          <p>Begge ramte {{ labels[results[0]] }}. Kast om!</p>
          <button type="button" class="bull-primary" @click="$emit('rethrow')">Kast om</button>
        </template>
        <template v-else-if="res.status === 'closest'">
          <p>{{ closestQuestion || 'Begge ramte udenfor. Hvem var tættest på midten?' }}</p>
          <div class="bull-pair">
            <button type="button" class="bull-primary" @click="$emit('closest', 0)">{{ closestLabels ? closestLabels[0] : names[0] }}</button>
            <button type="button" class="bull-primary" @click="$emit('closest', 1)">{{ closestLabels ? closestLabels[1] : names[1] }}</button>
          </div>
        </template>
        <template v-else>
          <p class="bull-winner">{{ names[res.winner] }} starter!</p>
          <button type="button" class="bull-primary" @click="$emit('start', res.winner)">{{ startText }}</button>
        </template>
      </div>

      <button type="button" class="bull-cancel" @click="$emit('cancel')">Annuller</button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { resolveBull, BULL_LABEL } from '@/bullsUp';

export default {
  name: 'BullsUpPanel',
  props: {
    names: { type: Array, required: true },
    results: { type: Array, required: true }, // [r0, r1], each null | 'bull' | '25' | 'out'
    editable: { type: Array, default: () => [true, true] },
    thinking: { type: Array, default: () => [false, false] },
    closestWinner: { type: Number, default: null },
    round: { type: Number, default: 1 },
    note: { type: String, default: '' },
    closestQuestion: { type: String, default: '' },
    closestLabels: { type: Array, default: null },
    startText: { type: String, default: 'Start' },
  },
  emits: ['set', 'closest', 'rethrow', 'start', 'cancel'],
  setup(props) {
    const res = computed(() => resolveBull(props.results[0], props.results[1], props.closestWinner));
    return { res, labels: BULL_LABEL, options: ['bull', '25', 'out'] };
  },
};
</script>

<style scoped>
.bull-backdrop {
  position: fixed;
  inset: 0;
  z-index: 12;
  background: var(--backdrop);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.bull {
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 20px;
  color: var(--text);
  font-family: 'Barlow', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 24px 60px var(--shadow);
}

.bull-head {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--accent);
}

.bull-title {
  margin: 0;
  font-family: var(--display);
  font-weight: 800;
  font-size: 28px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--text);
  line-height: 1;
}

.bull-round {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--muted);
}

.bull-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--bg);
  border-radius: 14px;
}

.bull-name {
  font-family: var(--display);
  font-weight: 700;
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.bull-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.bull-options button {
  height: 48px;
  border: 0;
  border-radius: 10px;
  background: var(--key);
  color: var(--text);
  font-family: var(--display);
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
}

.bull-options button:hover {
  background: var(--accent);
  color: var(--on-accent);
}

.bull-result {
  align-self: flex-start;
  font-family: var(--display);
  font-weight: 800;
  font-size: 22px;
  padding: 4px 12px;
  border-radius: 8px;
  background: var(--key);
}

.bull-result.r-bull {
  background: var(--gold);
  color: var(--on-gold);
}

.bull-result.r-25 {
  background: var(--accent);
  color: var(--on-accent);
}

.bull-result.r-out {
  color: var(--muted);
}

.bull-waiting {
  font-size: 14px;
  color: var(--muted);
  min-height: 34px;
  display: flex;
  align-items: center;
}

.bull-note {
  margin: -4px 0 0;
  font-size: 13px;
  color: var(--muted);
}

.bull-status {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
}

.bull-status p {
  margin: 0;
  color: var(--soft);
  font-size: 15px;
  line-height: 1.4;
}

.bull-status .bull-winner {
  font-family: var(--display);
  font-weight: 800;
  font-size: 26px;
  text-transform: uppercase;
  color: var(--text);
}

.bull-pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.bull-primary {
  height: 52px;
  border: 0;
  border-radius: 12px;
  background: var(--accent);
  color: var(--on-accent);
  font-family: var(--display);
  font-weight: 800;
  font-size: 19px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 10px;
}

.bull-primary:hover {
  background: var(--accent-hover);
}

.bull-cancel {
  align-self: center;
  height: 40px;
  padding: 0 16px;
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.bull-cancel:hover {
  color: var(--text);
}
</style>

<template>
  <button
    v-if="available || locked"
    type="button"
    class="lock-btn"
    :class="{ on: locked }"
    :aria-pressed="locked ? 'true' : 'false'"
    :aria-label="locked ? 'Lås skærmen op' : 'Lås skærmen til spil'"
    :title="locked ? 'Lås op' : 'Lås til spil (fuld skærm, ingen scroll)'"
    @click="toggle"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path v-if="locked" d="M8 11V7a4 4 0 0 1 8 0v4" />
      <path v-else d="M8 11V7a4 4 0 0 1 7.5-2" />
    </svg>
  </button>
</template>

<script>
import { watch, onUnmounted } from 'vue';
import { locked, lockGame, unlockGame, fullscreenSupported, isStandalone } from '@/gameLock';
import { showAlert } from '@/dialog';

const HINT_KEY = 'borgdart_lock_hint_shown';

export default {
  name: 'LockButton',
  props: {
    // Only offer the lock while a game is being played.
    available: { type: Boolean, default: true },
  },
  setup(props) {
    const toggle = async () => {
      if (locked.value) {
        unlockGame();
        return;
      }
      await lockGame();
      // iPhone Safari can't go fullscreen; explain once how to get it.
      let shown = false;
      try { shown = localStorage.getItem(HINT_KEY) === '1'; } catch (e) { shown = true; }
      if (!fullscreenSupported && !isStandalone() && !shown) {
        try { localStorage.setItem(HINT_KEY, '1'); } catch (e) { /* ignore */ }
        showAlert('Skærmen er låst, så den ikke scroller. For rigtig fuld skærm på iPhone: tryk Del → "Føj til hjemmeskærm", og åbn Borg Dart derfra.', { title: 'Låst til spil' });
      }
    };

    // Leaving the game (or the game ending up in setup) unlocks the page again.
    watch(() => props.available, (ok) => { if (!ok && locked.value) unlockGame(); });
    onUnmounted(() => unlockGame());

    return { locked, toggle };
  },
};
</script>

<style scoped>
.lock-btn {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background-color 0.15s;
}

.lock-btn:hover {
  color: var(--text);
  border-color: var(--accent);
}

.lock-btn.on {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}
</style>

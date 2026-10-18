<template>
  <div class="voice">
    <button
      type="button"
      class="mic"
      :class="{ on: voice.listening.value }"
      :aria-pressed="voice.listening.value ? 'true' : 'false'"
      :aria-label="voice.listening.value ? 'Stop stemmeinput' : 'Start stemmeinput'"
      :title="voice.listening.value ? 'Lytter … tryk for at stoppe' : 'Tryk for at tale scoren'"
      @click="voice.toggle()"
    >
      <span v-if="voice.listening.value" class="pulse" aria-hidden="true"></span>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        <path v-if="!voice.listening.value" d="M4 4l16 16" class="slash" />
      </svg>
    </button>

    <teleport to="body">
      <div v-if="voice.pending.value" class="voice-toast" role="status" aria-live="assertive">
        <div class="vt-top">
          <span class="vt-label">Hørte</span>
          <span class="vt-value">{{ voice.pending.value.value }}</span>
        </div>
        <div class="vt-bar"><span :style="{ animationDuration: delay + 'ms' }"></span></div>
        <div class="vt-actions">
          <button type="button" class="vt-cancel" @click="voice.cancelPending()">Fortryd</button>
          <button type="button" class="vt-ok" @click="voice.confirmNow()">OK</button>
        </div>
      </div>
      <div v-else-if="voice.flash.value" class="voice-flash" role="status">{{ voice.flash.value }}</div>
      <div v-else-if="voice.error.value" class="voice-flash error" role="alert">{{ voice.error.value }}</div>
    </teleport>
  </div>
</template>

<script>
import { VOICE_DELAY } from '@/useVoiceInput';

export default {
  name: 'VoiceInput',
  props: {
    // The object returned by useVoiceInput()
    voice: { type: Object, required: true },
  },
  setup() {
    return { delay: VOICE_DELAY };
  },
};
</script>

<style scoped>
.voice {
  display: flex;
}

.mic {
  position: relative;
  width: 60px;
  height: 60px;
  border: 0;
  border-radius: 12px;
  background: var(--key2);
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.mic.on {
  background: var(--accent);
  color: var(--on-accent);
}

.mic .slash {
  stroke: var(--muted);
}

.pulse {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  box-shadow: 0 0 0 0 var(--accent);
  animation: pulse 1.6s ease-out infinite;
  pointer-events: none;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 var(--accent); opacity: 0.7; }
  100% { box-shadow: 0 0 0 10px var(--accent); opacity: 0; }
}
</style>

<style>
/* Teleported to <body>, so not scoped. */
.voice-toast {
  position: fixed;
  left: 50%;
  bottom: calc(20px + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  z-index: 40;
  width: min(360px, calc(100vw - 32px));
  box-sizing: border-box;
  background: var(--surface);
  border: 1px solid var(--accent);
  border-radius: 16px;
  padding: 14px 14px 12px;
  box-shadow: 0 16px 40px var(--shadow);
  color: var(--text);
  font-family: 'Barlow', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.voice-toast .vt-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.voice-toast .vt-label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.voice-toast .vt-value {
  font-family: var(--display);
  font-weight: 800;
  font-size: 48px;
  line-height: 0.9;
}

.voice-toast .vt-bar {
  height: 4px;
  border-radius: 2px;
  background: var(--key);
  overflow: hidden;
}

.voice-toast .vt-bar span {
  display: block;
  height: 100%;
  background: var(--accent);
  transform-origin: left;
  animation-name: voice-countdown;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes voice-countdown {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.voice-toast .vt-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.voice-toast button {
  height: 44px;
  border-radius: 10px;
  font-family: var(--display);
  font-weight: 800;
  font-size: 17px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
}

.voice-toast .vt-cancel {
  border: 1px solid var(--line);
  background: var(--key);
  color: var(--text);
}

.voice-toast .vt-ok {
  border: 0;
  background: var(--accent);
  color: var(--on-accent);
}

.voice-flash {
  position: fixed;
  left: 50%;
  bottom: calc(20px + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  z-index: 40;
  max-width: calc(100vw - 32px);
  box-sizing: border-box;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 10px 18px;
  color: var(--text);
  font-family: 'Barlow', system-ui, sans-serif;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 10px 30px var(--shadow);
}

.voice-flash.error {
  border-color: var(--danger);
  color: var(--danger);
  border-radius: 14px;
}
</style>

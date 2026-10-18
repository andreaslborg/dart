// Listens to the microphone and turns spoken scores into entries.
//
// A heard score is shown with a short countdown before it is submitted,
// so a wrong guess can be cancelled ("Fortryd", or saying "no"/"nej").
import { ref, computed, watch, onUnmounted } from 'vue';
import { local } from '@/settings';
import { voiceSupported, parseScore, parseDarts, isCancel } from '@/voice';

export const VOICE_DELAY = 1600;

export function useVoiceInput({ canScore, onScore, sheetOpen, onDarts }) {
  const listening = ref(false);
  const pending = ref(null); // { value }
  const heard = ref('');
  const flash = ref(''); // short confirmation, e.g. "2 darts"
  const error = ref('');
  const enabled = computed(() => Boolean(local.voice) && voiceSupported);
  const lang = () => (local.voiceLang === 'da' ? 'da' : 'en');

  let rec = null;
  let wanted = false; // the user wants it on (auto-restart when the browser stops)
  let timer = null;
  let flashTimer = null;

  const showFlash = (text) => {
    flash.value = text;
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => { flash.value = ''; }, 1400);
  };

  const cancelPending = () => {
    clearTimeout(timer);
    pending.value = null;
  };

  const confirmNow = () => {
    const p = pending.value;
    cancelPending();
    if (p && canScore()) onScore(p.value);
  };

  const startPending = (value) => {
    clearTimeout(timer);
    pending.value = { value };
    timer = setTimeout(confirmNow, VOICE_DELAY);
  };

  const handle = (alternatives) => {
    const texts = alternatives.filter(Boolean);
    if (!texts.length) return;
    heard.value = texts[0];
    const l = lang();

    if (pending.value) {
      if (texts.some(t => isCancel(t, l))) {
        cancelPending();
        showFlash('Fortrudt');
        return;
      }
      // A new number replaces the pending one.
    }
    if (sheetOpen && sheetOpen()) {
      for (const t of texts) {
        const d = parseDarts(t, l);
        if (d !== null) {
          onDarts(d);
          showFlash(`${d} ${d === 1 ? 'dart' : 'darts'} på double`);
          return;
        }
      }
      return;
    }
    if (!canScore()) return;
    for (const t of texts) {
      const n = parseScore(t, l);
      if (n !== null) {
        startPending(n);
        return;
      }
    }
  };

  const create = () => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new Ctor();
    r.lang = lang() === 'da' ? 'da-DK' : 'en-US';
    r.continuous = true;
    r.interimResults = false;
    r.maxAlternatives = 5;
    r.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (!res.isFinal) continue;
        const alts = [];
        for (let j = 0; j < res.length; j++) alts.push(res[j].transcript);
        handle(alts);
      }
    };
    r.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        error.value = 'Mikrofonen er ikke tilladt. Giv siden adgang i browserens indstillinger.';
        wanted = false;
      } else if (e.error === 'audio-capture') {
        error.value = 'Ingen mikrofon fundet.';
        wanted = false;
      }
      // 'no-speech' and 'aborted' are normal; onend restarts.
    };
    r.onend = () => {
      listening.value = false;
      if (wanted) {
        try {
          r.start();
          listening.value = true;
        } catch (e) {
          wanted = false;
        }
      }
    };
    return r;
  };

  const start = () => {
    if (!enabled.value) return;
    error.value = '';
    wanted = true;
    try {
      if (!rec) rec = create();
      rec.lang = lang() === 'da' ? 'da-DK' : 'en-US';
      rec.start();
      listening.value = true;
    } catch (e) {
      // Already started, or the browser refused (e.g. iPhone without a fresh tap).
      listening.value = Boolean(rec) && listening.value;
    }
  };

  const stop = () => {
    wanted = false;
    cancelPending();
    if (rec) {
      try { rec.abort(); } catch (e) { /* ignore */ }
    }
    listening.value = false;
  };

  const toggle = () => (listening.value ? stop() : start());

  // Turning the setting off or switching language stops / resets the recogniser.
  watch(enabled, (on) => { if (!on) stop(); });
  watch(() => local.voiceLang, () => {
    const was = listening.value;
    stop();
    rec = null;
    if (was) start();
  });
  // Don't keep a countdown running if it is no longer this player's turn.
  watch(() => canScore(), (ok) => { if (!ok) cancelPending(); });

  onUnmounted(() => {
    stop();
    clearTimeout(flashTimer);
  });

  return { enabled, listening, pending, heard, flash, error, toggle, cancelPending, confirmNow };
}

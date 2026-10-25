// "Lås til spil": fixes the game screen in place while playing.
//
// - asks the browser for real fullscreen where it is allowed (Android, iPad,
//   desktop; iPhone Safari does not allow it for web pages)
// - stops the page from scrolling or bouncing
// - keeps the screen awake while locked
// The layout itself is handled by CSS on html.game-locked (see App.vue).
import { ref } from 'vue';

export const locked = ref(false);

const root = () => document.documentElement;
export const fullscreenSupported = typeof document !== 'undefined'
  && Boolean(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
export const isStandalone = () => (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
  || window.navigator.standalone === true;

let sentinel = null;
async function keepAwake() {
  if (sentinel || !('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
  try {
    sentinel = await navigator.wakeLock.request('screen');
    sentinel.addEventListener('release', () => { sentinel = null; });
  } catch (e) { sentinel = null; }
}

// Block scrolling/bouncing gestures on the page while locked.
const blockTouchMove = (e) => {
  if (!locked.value) return;
  // Let the score input keep working; everything else stays put.
  if (e.target && e.target.closest && e.target.closest('.allow-scroll')) return;
  e.preventDefault();
};

let listening = false;
function listen() {
  if (listening) return;
  listening = true;
  document.addEventListener('touchmove', blockTouchMove, { passive: false });
  document.addEventListener('visibilitychange', () => {
    if (locked.value && document.visibilityState === 'visible') keepAwake();
  });
}

export async function lockGame() {
  listen();
  locked.value = true;
  window.scrollTo(0, 0);
  root().classList.add('game-locked');
  const el = root();
  try {
    if (el.requestFullscreen && !document.fullscreenElement) await el.requestFullscreen({ navigationUI: 'hide' });
    else if (el.webkitRequestFullscreen && !document.webkitFullscreenElement) el.webkitRequestFullscreen();
  } catch (e) { /* not allowed here: the CSS lock still applies */ }
  try {
    if (window.screen && window.screen.orientation && window.screen.orientation.lock) await window.screen.orientation.lock('portrait');
  } catch (e) { /* only works in fullscreen on some phones */ }
  keepAwake();
}

export async function unlockGame() {
  if (!locked.value && !root().classList.contains('game-locked')) return;
  locked.value = false;
  root().classList.remove('game-locked');
  try {
    if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
    else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen();
  } catch (e) { /* ignore */ }
  try {
    if (window.screen && window.screen.orientation && window.screen.orientation.unlock) window.screen.orientation.unlock();
  } catch (e) { /* ignore */ }
  if (sentinel) {
    sentinel.release().catch(() => {});
    sentinel = null;
  }
}

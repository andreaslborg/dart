// App settings.
//
// `local`  — this device only, kept in localStorage (name, seat, theme, ...).
// `shared` — the same for both players, kept in the database at /settings.
import { reactive, watch } from 'vue';
import { getDatabase, ref as firebaseRef, onValue, update } from 'firebase/database';

const LOCAL_KEY = 'borgdart_settings_v1';

const localDefaults = {
  name: '',
  seat: null, // 1, 2 or null
  theme: 'system', // 'system' | 'dark' | 'light'
  wakeLock: false,
  vibrate: true,
};

export const sharedDefaults = {
  defaultStartScore: 501,
  legsToWin: 0, // 0 = no limit
  doubleOut: true,
  askDoubles: true,
  checkoutHints: true,
};

function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export const local = reactive({ ...localDefaults, ...loadLocal() });
export const shared = reactive({ ...sharedDefaults });

watch(local, () => {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(local)); } catch (e) { /* storage unavailable */ }
}, { deep: true });

// ------------------------------------------------------------- shared ----

let sharedStarted = false;
export function startSharedSettings() {
  if (sharedStarted) return;
  sharedStarted = true;
  onValue(firebaseRef(getDatabase(), 'settings'), (snap) => {
    Object.assign(shared, sharedDefaults, snap.val() || {});
  });
}

export function setShared(patch) {
  Object.assign(shared, patch);
  return update(firebaseRef(getDatabase(), 'settings'), patch);
}

// -------------------------------------------------------------- theme ----

const prefersLight = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;

export function applyTheme() {
  const theme = local.theme === 'system' ? (prefersLight() ? 'light' : 'dark') : local.theme;
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#F3F4F6' : '#0E0F12');
}

// ---------------------------------------------------------- wake lock ----

export const wakeLockSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
export const vibrateSupported = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

let sentinel = null;
async function acquireWakeLock() {
  if (!wakeLockSupported || !local.wakeLock || sentinel || document.visibilityState !== 'visible') return;
  try {
    sentinel = await navigator.wakeLock.request('screen');
    sentinel.addEventListener('release', () => { sentinel = null; });
  } catch (e) {
    sentinel = null;
  }
}
function releaseWakeLock() {
  if (sentinel) {
    sentinel.release().catch(() => {});
    sentinel = null;
  }
}

let deviceStarted = false;
export function initDeviceSettings() {
  if (deviceStarted) return;
  deviceStarted = true;
  applyTheme();
  watch(() => local.theme, applyTheme);
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => { if (local.theme === 'system') applyTheme(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
  watch(() => local.wakeLock, (on) => (on ? acquireWakeLock() : releaseWakeLock()), { immediate: true });
  // The browser drops the wake lock when the tab is hidden; take it again on return.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') acquireWakeLock();
  });
}

// ---------------------------------------------------------- vibration ----

export function buzz() {
  if (local.vibrate && vibrateSupported) {
    try { navigator.vibrate(12); } catch (e) { /* ignore */ }
  }
}

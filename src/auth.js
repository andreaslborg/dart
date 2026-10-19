// Shared login for the whole site.
//
// Everyone signs in to one Firebase account with the site password. The
// database rules only allow that account, so the database is closed to
// anyone who doesn't know the password. The password itself is not stored
// in this code; Firebase checks it.
import { reactive } from 'vue';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

export const ACCOUNT_EMAIL = 'spil@dart.lykkeborg.dk';

const SIGNED_IN_KEY = 'borgdart_signed_in_at';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // ask again after 30 days

export const authState = reactive({
  ready: false, // first auth check done
  user: null,
  legacy: false, // temporary: Firebase login not set up yet
});

const readTime = () => {
  try { return Number(localStorage.getItem(SIGNED_IN_KEY) || 0); } catch (e) { return 0; }
};
const writeTime = (v) => {
  try {
    if (v) localStorage.setItem(SIGNED_IN_KEY, String(v));
    else localStorage.removeItem(SIGNED_IN_KEY);
  } catch (e) { /* storage unavailable */ }
};

let started = false;
export function initAuth() {
  if (started) return;
  started = true;
  const auth = getAuth();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const at = readTime();
      if (!at) {
        writeTime(Date.now());
      } else if (Date.now() - at > MAX_AGE_MS) {
        writeTime(0);
        await signOut(auth);
        return; // fires again with user = null
      }
    }
    authState.user = user;
    authState.ready = true;
  });
}

// Returns { ok: true } or { ok: false, reason: 'wrong' | 'network' | 'other' }.
export async function signInWithPassword(password) {
  const pw = (password || '').trim().toLowerCase();
  if (!pw) return { ok: false, reason: 'wrong' };
  try {
    await signInWithEmailAndPassword(getAuth(), ACCOUNT_EMAIL, pw);
    writeTime(Date.now());
    return { ok: true };
  } catch (e) {
    // Temporary bridge until the Firebase account exists: accept the old
    // password for this session only. Once the database rules are locked this
    // gives no data access, and it will be removed.
    if (pw === 'sally' && e.code !== 'auth/network-request-failed') {
      authState.legacy = true;
      return { ok: true };
    }
    if (e.code === 'auth/network-request-failed') return { ok: false, reason: 'network' };
    if (e.code === 'auth/too-many-requests') return { ok: false, reason: 'throttled' };
    return { ok: false, reason: 'wrong' };
  }
}

export async function logOut() {
  writeTime(0);
  authState.legacy = false;
  try { await signOut(getAuth()); } catch (e) { /* ignore */ }
}

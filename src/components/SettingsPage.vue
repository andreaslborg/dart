<template>
  <div class="settings-page">
    <div class="wrap">
      <header class="topbar">
        <router-link :to="backLink" class="icon-link" aria-label="Tilbage til scoreboard" title="Tilbage">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        </router-link>
        <h1 class="page-title">INDSTILLINGER</h1>
      </header>

      <!-- This device -->
      <section class="block">
        <h2 class="section-title">DENNE TELEFON</h2>
        <div class="card">
          <div class="row stack">
            <label class="row-label" for="set-name">Navn</label>
            <div class="name-row">
              <input id="set-name" v-model="nameDraft" type="text" maxlength="20" placeholder="Dit navn" autocomplete="off" @keyup.enter="saveName">
              <button type="button" class="small-btn" :disabled="!nameChanged" @click="saveName">Gem</button>
            </div>
            <p class="help">{{ local.seat ? `Bruges som navn for spiller ${local.seat} og i Spil mod AI.` : 'Bruges i Spil mod AI. Vælg "Hvem er jeg" for også at sætte det på scoreboardet.' }}</p>
          </div>

          <div class="row stack">
            <span class="row-label">Hvem er jeg</span>
            <div class="segmented three">
              <button type="button" :class="{ selected: !local.seat }" @click="setSeat(null)">Spørg</button>
              <button type="button" :class="{ selected: local.seat === 1 }" @click="setSeat(1)">{{ names[0] }}</button>
              <button type="button" :class="{ selected: local.seat === 2 }" @click="setSeat(2)">{{ names[1] }}</button>
            </div>
            <p class="help">Denne telefon taster altid for den valgte spiller.</p>
          </div>

          <div class="row stack">
            <span class="row-label">Tema</span>
            <div class="segmented three">
              <button type="button" :class="{ selected: local.theme === 'system' }" @click="local.theme = 'system'">Automatisk</button>
              <button type="button" :class="{ selected: local.theme === 'dark' }" @click="local.theme = 'dark'">Mørkt</button>
              <button type="button" :class="{ selected: local.theme === 'light' }" @click="local.theme = 'light'">Lyst</button>
            </div>
          </div>

          <div class="row">
            <div class="row-text">
              <span class="row-label">Hold skærmen tændt</span>
              <span class="help">{{ wakeLockSupported ? 'Telefonen går ikke i dvale, mens siden er åben.' : 'Understøttes ikke i denne browser.' }}</span>
            </div>
            <button type="button" role="switch" class="switch" :aria-checked="local.wakeLock ? 'true' : 'false'" aria-label="Hold skærmen tændt" :disabled="!wakeLockSupported" @click="local.wakeLock = !local.wakeLock"><span></span></button>
          </div>

          <div class="row">
            <div class="row-text">
              <span class="row-label">Vibration</span>
              <span class="help">{{ vibrateSupported ? 'Lille vibration, når du trykker på tastaturet.' : 'Understøttes ikke på denne telefon (fx iPhone).' }}</span>
            </div>
            <button type="button" role="switch" class="switch" :aria-checked="local.vibrate ? 'true' : 'false'" aria-label="Vibration" :disabled="!vibrateSupported" @click="toggleVibrate"><span></span></button>
          </div>
        </div>
      </section>

      <!-- Voice -->
      <section class="block">
        <h2 class="section-title">STEMMEINPUT</h2>
        <div class="card">
          <div class="row">
            <div class="row-text">
              <span class="row-label">Sig scoren højt</span>
              <span class="help">{{ voiceSupported ? 'Tryk på mikrofonen ved score-feltet og sig fx "forty five". Scoren tastes, og Enter trykkes efter en kort nedtælling.' : 'Understøttes ikke i denne browser. Prøv Chrome eller Safari.' }}</span>
            </div>
            <button type="button" role="switch" class="switch" :aria-checked="local.voice ? 'true' : 'false'" aria-label="Stemmeinput" :disabled="!voiceSupported" @click="local.voice = !local.voice"><span></span></button>
          </div>
          <div v-if="local.voice && voiceSupported" class="row stack">
            <span class="row-label">Sprog</span>
            <div class="segmented">
              <button type="button" :class="{ selected: local.voiceLang === 'en' }" @click="local.voiceLang = 'en'">Engelsk</button>
              <button type="button" :class="{ selected: local.voiceLang === 'da' }" @click="local.voiceLang = 'da'">Dansk</button>
            </div>
            <p class="help">{{ local.voiceLang === 'da'
              ? 'Fx "femogfyrre", "hundrede og fyrre", "ingen score". Sig "nej" eller "fortryd" for at stoppe en forkert score.'
              : 'Fx "forty five", "ton forty", "one eighty", "no score". Say "no" or "cancel" to stop a wrong score.' }}</p>
            <p class="help">Når der spørges om darts på double, kan du sige {{ local.voiceLang === 'da' ? '"nul", "en", "to" eller "tre"' : '"zero", "one", "two" or "three"' }}.</p>
          </div>
        </div>
      </section>

      <!-- Shared -->
      <section class="block">
        <h2 class="section-title">FÆLLES FOR KAMPEN</h2>
        <p class="section-help">Gælder for begge spillere.</p>
        <div class="card">
          <div class="row stack">
            <span class="row-label">Standard-spil</span>
            <div class="segmented">
              <button v-for="sc in [201, 301, 501, 701, 1000]" :key="sc" type="button" :class="{ selected: shared.defaultStartScore === sc }" @click="setShared({ defaultStartScore: sc })">{{ sc }}</button>
            </div>
            <p class="help">Bruges når I trykker "Ny kamp".</p>
          </div>

          <div class="row stack">
            <span class="row-label">Først til</span>
            <div class="segmented">
              <button v-for="n in [0, 2, 3, 5, 7]" :key="n" type="button" :class="{ selected: shared.legsToWin === n }" @click="setShared({ legsToWin: n })">{{ n === 0 ? 'Fri' : n }}</button>
            </div>
            <p class="help">{{ shared.legsToWin ? `Kampen er vundet, når en spiller har ${shared.legsToWin} legs.` : 'Ingen grænse. I spiller, til I trykker "Ny kamp".' }}</p>
          </div>

          <div class="row">
            <div class="row-text">
              <span class="row-label">Double-out</span>
              <span class="help">Bust ved under 0 eller 1 tilbage. Runden tæller 0, og turen går videre.</span>
            </div>
            <button type="button" role="switch" class="switch" :aria-checked="shared.doubleOut ? 'true' : 'false'" aria-label="Double-out" @click="setShared({ doubleOut: !shared.doubleOut })"><span></span></button>
          </div>

          <div class="row">
            <div class="row-text">
              <span class="row-label">Spørg om darts på double</span>
              <span class="help">Bruges til checkout %. Slå fra for mindre tastearbejde.</span>
            </div>
            <button type="button" role="switch" class="switch" :aria-checked="shared.askDoubles ? 'true' : 'false'" aria-label="Spørg om darts på double" @click="setShared({ askDoubles: !shared.askDoubles })"><span></span></button>
          </div>

          <div class="row">
            <div class="row-text">
              <span class="row-label">Checkout-forslag</span>
              <span class="help">Vis fx "T20 · T20 · BULL" under scoren.</span>
            </div>
            <button type="button" role="switch" class="switch" :aria-checked="shared.checkoutHints ? 'true' : 'false'" aria-label="Checkout-forslag" @click="setShared({ checkoutHints: !shared.checkoutHints })"><span></span></button>
          </div>
        </div>
      </section>

      <!-- Data -->
      <section class="block">
        <h2 class="section-title">DATA</h2>
        <div class="card">
          <div class="row">
            <div class="row-text">
              <span class="row-label">Nulstil scoreboard</span>
              <span class="help">Starter forfra uden at gemme. Navne beholdes.</span>
            </div>
            <button type="button" class="small-btn danger" @click="resetScoreboard">Nulstil</button>
          </div>
          <div class="row">
            <div class="row-text">
              <span class="row-label">Slet historik</span>
              <span class="help">Sletter alle gemte kampe.</span>
            </div>
            <button type="button" class="small-btn danger" @click="deleteHistory">Slet</button>
          </div>
          <div class="row">
            <div class="row-text">
              <span class="row-label">Log ud</span>
              <span class="help">Kræver adgangskoden igen på denne telefon.</span>
            </div>
            <button type="button" class="small-btn" @click="logOut">Log ud</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDatabase, ref as firebaseRef, onValue, update, remove } from 'firebase/database';
import { local, shared, setShared, wakeLockSupported, vibrateSupported, buzz } from '@/settings';
import { voiceSupported } from '@/voice';
import { showConfirm, showAlert } from '@/dialog';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const database = getDatabase();
    const scoresRef = firebaseRef(database, 'scores');
    const names = ref(['Spiller 1', 'Spiller 2']);
    const nameDraft = ref(local.name);
    let stop = null;

    const backLink = computed(() => {
      const query = { ...route.query };
      if (local.seat) query.player = String(local.seat);
      return { path: '/', query };
    });

    const nameChanged = computed(() => nameDraft.value.trim() !== (local.name || '') && nameDraft.value.trim() !== '');

    const saveName = () => {
      const name = nameDraft.value.trim();
      if (!name) return;
      local.name = name;
      if (local.seat) update(scoresRef, { [`player${local.seat}Name`]: name });
    };

    const setSeat = (seat) => {
      local.seat = seat;
      const query = { ...route.query };
      if (seat) query.player = String(seat); else delete query.player;
      router.replace({ query });
      // Pick up the name the scoreboard already uses for that seat.
      if (seat && !local.name) nameDraft.value = names.value[seat - 1];
    };

    const toggleVibrate = () => {
      local.vibrate = !local.vibrate;
      buzz();
    };

    const resetScoreboard = async () => {
      if (!(await showConfirm('Scores, legs og stats nulstilles. Den nuværende kamp bliver ikke gemt yderligere.', { title: 'Nulstil scoreboard?', confirmText: 'Nulstil', danger: true }))) return;
      const start = shared.defaultStartScore || 501;
      await update(scoresRef, {
        player1: start, player2: start, startScore: start,
        player1Wins: 0, player2Wins: 0, isPlayer1Turn: true, matchStarter: null,
        player1Checkout: '', player2Checkout: '',
        player1Scores: [], player2Scores: [], player1SetScores: [], player2SetScores: [],
        player1HighestCheckout: null, player2HighestCheckout: null,
        player1LowestCheckout: null, player2LowestCheckout: null,
        player1DoubleDarts: [], player2DoubleDarts: [], player1LegDarts: [], player2LegDarts: [],
        player1Checkouts: [], player2Checkouts: [],
        currentMatchId: null, matchStartedAt: null, scoreboardTitle: 'Borg Dart',
      });
      showAlert('Scoreboardet er nulstillet.', { title: 'Klar' });
    };

    const deleteHistory = async () => {
      if (!(await showConfirm('Alle gemte kampe slettes. Det kan ikke fortrydes.', { title: 'Slet historik?', confirmText: 'Slet alt', danger: true }))) return;
      await update(scoresRef, { currentMatchId: null, matchStartedAt: null });
      await remove(firebaseRef(database, 'history/matches'));
      showAlert('Historikken er slettet.', { title: 'Klar' });
    };

    const logOut = async () => {
      if (!(await showConfirm('Du skal indtaste adgangskoden igen for at bruge siden.', { title: 'Log ud?', confirmText: 'Log ud' }))) return;
      document.cookie = 'borgdart_access=; Max-Age=0; Path=/';
      window.location.reload();
    };

    onMounted(() => {
      stop = onValue(scoresRef, (snap) => {
        const d = snap.val() || {};
        names.value = [d.player1Name || 'Spiller 1', d.player2Name || 'Spiller 2'];
      });
    });
    onUnmounted(() => { if (stop) stop(); });

    return {
      local, shared, setShared, names, nameDraft, nameChanged, backLink,
      wakeLockSupported, vibrateSupported, voiceSupported,
      saveName, setSeat, toggleVibrate, resetScoreboard, deleteHistory, logOut,
    };
  },
};
</script>

<style scoped>
.settings-page {
  color: var(--text);
  font-family: 'Barlow', system-ui, sans-serif;
  padding: 16px 16px 48px;
  box-sizing: border-box;
}

.settings-page *,
.settings-page *::before,
.settings-page *::after {
  box-sizing: border-box;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

.wrap {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
}

.page-title {
  margin: 0;
  font-family: var(--display);
  font-weight: 800;
  font-size: 26px;
  letter-spacing: 0.04em;
}

.icon-link {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 999px;
  border: 1px solid var(--line);
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-link:hover {
  color: var(--text);
  border-color: var(--accent);
}

.block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  margin: 0;
  font-family: var(--display);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.14em;
  color: var(--muted);
}

.section-help {
  margin: -4px 0 2px;
  font-size: 13px;
  color: var(--muted);
}

.card {
  background: var(--surface);
  border-radius: 16px;
  padding: 4px 16px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--line2);
}

.row:last-child {
  border-bottom: 0;
}

.row.stack {
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.row-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.row-label {
  font-weight: 600;
  font-size: 16px;
}

.help {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.4;
}

.name-row {
  display: flex;
  gap: 8px;
}

.name-row input {
  flex: 1;
  min-width: 0;
  height: 48px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--text);
  font-family: var(--display);
  font-weight: 700;
  font-size: 20px;
  outline: none;
}

.name-row input:focus {
  border-color: var(--accent);
}

.name-row input::placeholder {
  color: var(--placeholder);
}

.small-btn {
  flex: 0 0 auto;
  min-width: 80px;
  height: 44px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--key);
  color: var(--text);
  font-weight: 600;
  font-size: 14px;
}

.small-btn:not(:disabled):hover {
  background: var(--key-hover);
}

.small-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.name-row .small-btn:not(:disabled) {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}

.small-btn.danger {
  color: var(--danger);
}

.segmented {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 4px;
  background: var(--bg);
  border-radius: 12px;
  padding: 4px;
}

.segmented button {
  height: 42px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--muted);
  font-family: var(--display);
  font-size: 17px;
  font-weight: 700;
  padding: 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.segmented button:hover {
  color: var(--text);
}

.segmented button.selected {
  background: var(--accent);
  color: var(--on-accent);
}

.switch {
  position: relative;
  flex: 0 0 auto;
  width: 52px;
  height: 32px;
  border-radius: 999px;
  border: 0;
  background: var(--line);
  padding: 0;
  transition: background-color 0.15s;
}

.switch span {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: transform 0.15s;
}

.switch[aria-checked="true"] {
  background: var(--accent);
}

.switch[aria-checked="true"] span {
  transform: translateX(20px);
}

.switch:disabled {
  opacity: 0.4;
  cursor: default;
}

.switch:focus-visible,
.segmented button:focus-visible,
.small-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>

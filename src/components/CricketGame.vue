<template>
  <div class="cricket game-screen">
    <div class="wrap lock-col">
      <header class="topbar">
        <router-link :to="backLink" class="icon-link" aria-label="Tilbage til scoreboard" title="Tilbage">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        </router-link>
        <h1 class="page-title">CRICKET</h1>
        <div v-if="inGame" class="pill">{{ modeLabel }} · LEG {{ g.legNo }} · TIL {{ g.legsToWin }}</div>
        <LockButton :available="inGame" />
      </header>

      <!-- ===================== SETUP ===================== -->
      <section v-if="g.phase === 'setup'" class="setup">
        <div class="field">
          <span class="field-label">Spil</span>
          <div class="segmented">
            <button type="button" :class="{ selected: setup.mode === 'local' }" @click="setMode('local')">Lokalt</button>
            <button type="button" :class="{ selected: setup.mode === 'ai' }" @click="setMode('ai')">Mod AI</button>
            <button type="button" :class="{ selected: setup.mode === 'online' }" @click="setMode('online')">Online 1v1</button>
          </div>
        </div>

        <!-- Local: 2-4 players on this phone -->
        <template v-if="setup.mode === 'local'">
          <div class="field">
            <span class="field-label">Antal spillere</span>
            <div class="segmented">
              <button v-for="n in [2, 3, 4]" :key="n" type="button" :class="{ selected: setup.count === n }" @click="setup.count = n">{{ n }}</button>
            </div>
          </div>
          <div class="field">
            <div class="field-head">
              <span class="field-label">Spillere</span>
              <button type="button" class="link-btn" @click="shuffle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>
                Bland
              </button>
            </div>
            <div class="names">
              <label v-for="(p, i) in setup.names.slice(0, setup.count)" :key="'n' + i" class="name-input" :style="{ '--c': colors[i] }">
                <span class="dot" aria-hidden="true"></span>
                <span class="sr-only">Navn på spiller {{ i + 1 }}</span>
                <input v-model="setup.names[i]" type="text" maxlength="16" :placeholder="`Spiller ${i + 1}`" autocomplete="off">
              </label>
            </div>
            <div v-if="suggestions.length" class="chips">
              <span class="chips-label">Tidligere:</span>
              <button v-for="n in suggestions" :key="'s' + n" type="button" class="chip" @click="addName(n)">{{ n }}</button>
            </div>
          </div>
        </template>

        <!-- Against the bot -->
        <template v-else-if="setup.mode === 'ai'">
          <div class="field">
            <span class="field-label">Dit navn</span>
            <label class="name-input" :style="{ '--c': colors[0] }">
              <span class="dot" aria-hidden="true"></span>
              <input v-model="setup.myName" type="text" maxlength="16" placeholder="Dit navn" autocomplete="off" aria-label="Dit navn">
            </label>
          </div>
          <div class="field">
            <span class="field-label">Niveau</span>
            <div class="levels">
              <button v-for="lv in levelList" :key="lv.key" type="button" class="level" :class="{ selected: setup.level === lv.key }" @click="setup.level = lv.key">
                <span class="level-name">{{ lv.name }}</span>
                <span class="level-avg">{{ mprHint[lv.key] }} MPR</span>
              </button>
            </div>
          </div>
        </template>

        <!-- Online: the two phones from the scoreboard -->
        <template v-else>
          <div class="online-card">
            <div v-for="i in [0, 1]" :key="'o' + i" class="online-row" :style="{ '--c': colors[i] }">
              <span class="dot" aria-hidden="true"></span>
              <span class="online-name">{{ onlineNames[i] }}</span>
              <span v-if="mySeat === i" class="me-tag">DIG</span>
            </div>
            <p class="help">Begge telefoner åbner Cricket. Navnene kommer fra scoreboardet.</p>
          </div>
          <div class="field">
            <span class="field-label">Denne telefon er</span>
            <div class="segmented">
              <button v-for="i in [0, 1]" :key="'seat' + i" type="button" :class="{ selected: mySeat === i }" @click="local.seat = i + 1">{{ onlineNames[i] }}</button>
            </div>
          </div>
        </template>

        <div class="field">
          <span class="field-label">Rækkefølge</span>
          <div class="segmented">
            <button type="button" :class="{ selected: setup.order === 'free' }" @click="setup.order = 'free'">Fri</button>
            <button type="button" :class="{ selected: setup.order === 'strict' }" @click="setup.order = 'strict'">20 → 15 → Bull</button>
          </div>
        </div>

        <div class="field">
          <span class="field-label">Først til</span>
          <div class="segmented">
            <button v-for="n in [1, 2, 3, 5]" :key="n" type="button" :class="{ selected: setup.legsToWin === n }" @click="setup.legsToWin = n">{{ n }} {{ n === 1 ? 'leg' : 'legs' }}</button>
          </div>
        </div>

        <div class="field">
          <span class="field-label">Hvem starter?</span>
          <div class="segmented">
            <button v-for="opt in starterOptions" :key="opt.key" type="button" :class="{ selected: setup.start === opt.key }" @click="setup.start = opt.key">{{ opt.label }}</button>
          </div>
        </div>

        <p v-if="setupError" class="error" role="alert">{{ setupError }}</p>
        <button type="button" class="primary-btn" @click="startMatch">Start kamp</button>

        <details class="rules">
          <summary>Sådan spilles Cut-throat</summary>
          <ul>
            <li>Der spilles på 20, 19, 18, 17, 16, 15 og bull.</li>
            <li>Ram et tal 3 gange for at lukke det. Double tæller 2, triple 3. Ydre bull tæller 1, bullseye 2.</li>
            <li>Når du har lukket et tal, giver hver ekstra træffer point til de modstandere, der ikke har lukket det.</li>
            <li>Når alle har lukket et tal, er det dødt.</li>
            <li>Du vinder, når du har lukket alt og har færrest point (eller lige med færrest).</li>
          </ul>
        </details>
      </section>

      <!-- ===================== BULLS UP ===================== -->
      <div v-else-if="g.phase === 'bull'" class="bull">
        <div class="bull-head">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg>
          <div>
            <h2 class="bull-title">Bull om start</h2>
            <p class="bull-round">Runde {{ g.bull.round }}{{ g.bull.round > 1 ? ' · kun dem der stod lige' : '' }}</p>
          </div>
        </div>
        <div v-for="(p, i) in g.players" :key="'b' + i" class="bull-row" :class="{ out: !g.bull.active[i] }" :style="{ '--c': colors[i] }">
          <span class="bull-name"><span class="dot" aria-hidden="true"></span>{{ p.name }}</span>
          <div v-if="g.bull.active[i] && !g.bull.results[i] && canBull(i)" class="bull-options" role="group" :aria-label="`Hvor ramte ${p.name}?`">
            <button v-for="opt in ['bull', '25', 'out']" :key="opt" type="button" @click="setBull(i, opt)">{{ bullLabel[opt] }}</button>
          </div>
          <span v-else-if="g.bull.results[i] && bullVisible(i)" class="bull-result" :class="'r-' + g.bull.results[i]">{{ bullLabel[g.bull.results[i]] }}</span>
          <span v-else-if="g.bull.results[i]" class="bull-wait">Har kastet · vælg dit eget først</span>
          <span v-else-if="g.bull.active[i]" class="bull-wait">{{ p.bot ? 'Kaster…' : 'Venter' }}</span>
        </div>
        <div class="bull-status" aria-live="polite">
          <p v-if="bullRes.status === 'waiting'">Kast én pil hver mod bull, og tryk hvor den landede.</p>
          <template v-else-if="bullRes.status === 'rethrow'">
            <p>Lige mellem {{ bullRes.tied.map(i => g.players[i].name).join(' og ') }}. De kaster om!</p>
            <button type="button" class="primary-btn" @click="bullRethrow">Kast om</button>
          </template>
          <template v-else>
            <p class="bull-winner">{{ g.players[bullRes.winner].name }} starter!</p>
            <button type="button" class="primary-btn" @click="beginPlay(bullRes.winner)">Start kamp</button>
          </template>
        </div>
        <button type="button" class="ghost-btn" @click="quitMatch(true)">Annuller</button>
      </div>

      <!-- ===================== GAME ===================== -->
      <template v-else>
        <div v-if="g.phase === 'done'" class="banner" :style="{ '--c': colors[g.lastLegWinner] }">
          <span>{{ g.players[g.lastLegWinner].name }} vandt kampen!</span>
        </div>
        <div v-else-if="g.legOver" class="banner" :style="{ '--c': colors[g.lastLegWinner] }">
          <span>{{ g.players[g.lastLegWinner].name }} vandt leg {{ g.legNo }}</span>
          <button type="button" class="next-leg" @click="nextLeg">
            Næste leg
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>

        <!-- Whose turn + this visit's darts -->
        <section v-if="g.phase === 'play' && !g.legOver" class="turn-card" :style="{ '--c': colors[g.turn] }" aria-live="polite">
          <div class="turn-left">
            <span class="turn-tag">{{ turnTag }}</span>
            <span class="turn-name">{{ g.players[g.turn].name }}</span>
          </div>
          <div class="visit" aria-label="Pile i denne runde">
            <span v-for="k in 3" :key="'v' + k" class="visit-dart" :class="{ empty: !g.visit[k - 1], hit: g.visit[k - 1] && g.visit[k - 1].marked }">
              {{ g.visit[k - 1] ? dartLabel(g.visit[k - 1]) : '' }}
            </span>
          </div>
        </section>
        <p v-if="lastVisitText && g.phase === 'play' && !g.legOver" class="last-visit">{{ lastVisitText }}</p>

        <!-- Marks board -->
        <div class="board" :style="{ '--cols': g.players.length }" role="table" aria-label="Cricket-tavle">
          <div class="b-row b-head" role="row">
            <span class="b-num" role="columnheader"></span>
            <span
              v-for="(p, i) in g.players" :key="'h' + i" role="columnheader"
              class="b-player" :class="{ active: i === g.turn && g.phase === 'play' && !g.legOver }" :style="{ '--c': colors[i] }"
            >
              <span class="b-pname"><span class="dot" aria-hidden="true"></span>{{ p.name }}</span>
              <span class="b-points">{{ g.points[i] }}</span>
              <span class="b-legs">{{ ranks[i] }}. · {{ g.legs[i] }} {{ g.legs[i] === 1 ? 'leg' : 'legs' }}</span>
            </span>
          </div>
          <div v-for="(t, ti) in targets" :key="'r' + t" class="b-row" :class="{ dead: isDead(t), next: isNextForTurn(t) }" role="row">
            <span class="b-num" role="rowheader">{{ targetName(t) }}</span>
            <span
              v-for="(p, i) in g.players" :key="'c' + t + i" role="cell"
              class="b-cell" :class="{ active: i === g.turn && g.phase === 'play' && !g.legOver }" :style="{ '--c': colors[i] }"
              :aria-label="`${p.name}: ${markText(g.marks[i][ti])}`"
            >
              <svg v-if="g.marks[i][ti] >= 1" class="mark" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 18L18 6" />
                <path v-if="g.marks[i][ti] >= 2" d="M6 6l12 12" />
                <circle v-if="g.marks[i][ti] >= 3" cx="12" cy="12" r="10" />
              </svg>
            </span>
          </div>
        </div>

        <!-- Dart input -->
        <template v-if="g.phase === 'play'">
          <p v-if="waitText" class="wait-text" aria-live="polite">{{ waitText }}</p>
          <div class="mult" role="group" aria-label="Ring">
            <button v-for="m in [1, 2, 3]" :key="'m' + m" type="button" :class="{ selected: mult === m }" :disabled="!canInput" @click="mult = m">{{ ['Single', 'Double', 'Triple'][m - 1] }}</button>
          </div>
          <div class="keypad targets-pad">
            <button
              v-for="t in targets" :key="'k' + t" type="button" class="key"
              :class="{ next: isNextForTurn(t) }"
              :disabled="!canInput || !allowed(t) || (t === 25 && mult === 3)"
              @click="enter(t)"
            >{{ t === 25 ? (mult === 2 ? 'BULL' : '25') : (mult === 3 ? 'T' : mult === 2 ? 'D' : '') + t }}</button>
            <button type="button" class="key miss" :disabled="!canInput" @click="enter(0)">MISS</button>
          </div>
          <div class="actions">
            <button type="button" :disabled="!canUndo" @click="undoDart">Fortryd pil</button>
            <button type="button" :disabled="!canInput || !g.visit.length" @click="endVisitEarly">Skift tur</button>
            <button type="button" class="danger lock-hide" @click="quitMatch(false)">Afslut kamp</button>
          </div>
        </template>

        <section class="stats-block lock-hide">
          <h2 class="section-title">STATS</h2>
          <div class="stats" :style="{ '--cols': g.players.length }">
            <div class="stats-row head">
              <span></span>
              <span v-for="(p, i) in g.players" :key="'sh' + i" :style="{ '--c': colors[i] }"><span class="dot" aria-hidden="true"></span>{{ p.name }}</span>
            </div>
            <div v-for="row in statRows" :key="row.label" class="stats-row">
              <span>{{ row.label }}</span>
              <span v-for="(v, i) in row.values" :key="row.label + i">{{ v }}</span>
            </div>
          </div>
        </section>

        <div v-if="g.phase === 'done'" class="end-actions">
          <button type="button" class="primary-btn" @click="rematch">Omkamp</button>
          <button type="button" class="ghost-btn" @click="quitMatch(true)">Ny opsætning</button>
        </div>
      </template>
    </div>

    <!-- Turn change flash (local games on one phone) -->
    <transition name="flash">
      <button v-if="flash" type="button" class="turn-flash" :style="{ '--c': flash.color }" @click="flash = null">
        <span class="tf-name">{{ flash.label }}</span>
        <span class="tf-score">{{ flash.points }} point</span>
      </button>
    </transition>
  </div>
</template>

<script>
import { reactive, ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { getDatabase, ref as firebaseRef, set, push, get, onValue } from 'firebase/database';
import confetti from 'canvas-confetti';
import { LEVELS, throwDart, throwBull } from '@/ai/dartBot';
import { BULL_LABEL, dartToBull } from '@/bullsUp';
import { resolveBullMulti, turnLabel, SIDE_COLORS } from '@/localGame';
import { matchList, playerNames } from '@/matchHistory';
import { showConfirm } from '@/dialog';
import { local, buzz } from '@/settings';
import LockButton from '@/components/LockButton.vue';
import {
  TARGETS, targetName, dartLabel, freshStats, freshLeg, applyDart, legWinner, targetAllowed, deadFor, nextStrict,
  standing, fmtMpr, botTarget, dartToCricket, cricketLevel,
} from '@/cricket';

const STORE_KEY = 'borgdart_cricket_v1';
const BOT_DELAY = 700;
const UNDO_MAX = 40;
const MPR_HINT = { begynder: '0,9', pub: '1,6', liga: '2,4', pro: '3,4' };

const load = () => {
  try { const v = localStorage.getItem(STORE_KEY); return v ? JSON.parse(v) : null; } catch (e) { return null; }
};
const save = (v) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(v)); } catch (e) { /* storage unavailable */ }
};
const plain = (o) => JSON.parse(JSON.stringify(o));

const blankGame = () => ({
  mode: 'local', phase: 'setup', order: 'free', legsToWin: 2, legNo: 1, level: 'pub',
  players: [], legs: [], marks: [], points: [], stats: [], turn: 0, firstStarter: 0,
  visit: [], prev: null, legOver: false, lastLegWinner: 0, undo: [], matchId: null, startedAt: null,
  bull: { results: [], active: [], round: 1 },
});

// Firebase drops empty arrays and nulls inside arrays: rebuild the full shape.
function normalize(raw) {
  const g = { ...blankGame(), ...(raw || {}) };
  const n = Array.isArray(g.players) ? g.players.length : Object.keys(g.players || {}).length;
  const arr = (v, fill) => Array.from({ length: n }, (_, i) => {
    const x = v ? v[i] : undefined;
    return x === undefined || x === null ? (typeof fill === 'function' ? fill() : fill) : x;
  });
  g.players = arr(g.players, () => ({ name: '' }));
  g.legs = arr(g.legs, 0);
  g.points = arr(g.points, 0);
  g.marks = arr(g.marks, () => TARGETS.map(() => 0)).map(row => TARGETS.map((t, i) => (row && row[i]) || 0));
  g.stats = arr(g.stats, freshStats).map(s => ({ ...freshStats(), ...s }));
  g.visit = Object.values(g.visit || {});
  g.undo = Object.values(g.undo || {});
  const b = g.bull || {};
  g.bull = { round: b.round || 1, results: arr(b.results, null), active: arr(b.active, false) };
  return g;
}

export default {
  name: 'CricketGame',
  components: { LockButton },
  setup() {
    const route = useRoute();
    const database = getDatabase();
    const onlineRef = firebaseRef(database, 'scores/cricket');
    const backLink = computed(() => ({ path: '/', query: route.query }));
    const saved = load();

    const setup = reactive({
      mode: 'local', count: 2, names: ['', '', '', ''], myName: local.name || '', level: 'pub',
      order: 'free', legsToWin: 2, start: 'bull',
      ...(saved && saved.setup ? saved.setup : {}),
    });
    if (!setup.names.some(Boolean) && local.name) setup.names[0] = local.name;

    // Two games can exist: one on this phone (local / AI) and the shared online one.
    const lg = reactive(normalize(saved && saved.game));
    const og = reactive(blankGame());
    const src = ref(lg.phase !== 'setup' ? 'local' : (setup.mode === 'online' ? 'online' : 'local'));
    const g = computed(() => (src.value === 'online' ? og : lg));

    const mult = ref(1);
    const flash = ref(null);
    const setupError = ref('');
    const botBusy = ref(false);
    let flashTimer = null;
    let botTimer = null;

    const commit = () => {
      if (src.value === 'online') {
        set(onlineRef, plain(og)).catch(err => console.error('Kunne ikke gemme online-spil:', err));
      }
      save({ game: lg, setup });
    };
    watch(setup, () => save({ game: lg, setup }), { deep: true });

    // ---------- online sync (scores/cricket + names from the scoreboard)
    const onlineNames = ref(['Spiller 1', 'Spiller 2']);
    const mySeat = computed(() => (local.seat === 1 || local.seat === 2 ? local.seat - 1 : -1));
    let stopOnline = null;
    onMounted(() => {
      stopOnline = onValue(firebaseRef(database, 'scores'), (snap) => {
        const v = snap.val() || {};
        onlineNames.value = [v.player1Name || 'Spiller 1', v.player2Name || 'Spiller 2'];
        Object.assign(og, normalize(v.cricket));
        // Join a running online game unless a local one is in progress here.
        if (og.phase !== 'setup' && lg.phase === 'setup') src.value = 'online';
      });
    });

    // ---------- setup
    const colors = SIDE_COLORS;
    const levelList = Object.values(LEVELS);
    const knownNames = ref([]);
    onMounted(async () => {
      try {
        const snap = await get(firebaseRef(database, 'history/matches'));
        knownNames.value = playerNames(matchList(snap.val())).filter(n => !/^bot \(/i.test(n));
      } catch (e) { /* offline: no suggestions */ }
    });
    const suggestions = computed(() => {
      const used = setup.names.slice(0, setup.count).map(n => n.trim().toLowerCase());
      return knownNames.value.filter(n => !used.includes(n.toLowerCase())).slice(0, 8);
    });
    const addName = (n) => {
      const i = setup.names.slice(0, setup.count).findIndex(x => !x.trim());
      if (i >= 0) setup.names[i] = n;
    };
    const shuffle = () => {
      const arr = setup.names.slice(0, setup.count);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      arr.forEach((n, i) => { setup.names[i] = n; });
    };
    const starterOptions = computed(() => {
      if (setup.mode === 'ai') return [{ key: 'bull', label: 'Bull' }, { key: 'p0', label: 'Mig' }, { key: 'p1', label: 'Bot' }];
      if (setup.mode === 'online') return [{ key: 'bull', label: 'Bull' }, { key: 'p0', label: onlineNames.value[0] }, { key: 'p1', label: onlineNames.value[1] }];
      return [{ key: 'bull', label: 'Bull om start' }, { key: 'p0', label: 'Som skrevet' }];
    });
    const setMode = (m) => {
      setup.mode = m;
      if (!starterOptions.value.some(o => o.key === setup.start)) setup.start = 'bull';
      setupError.value = '';
    };

    const startMatch = () => {
      let players;
      if (setup.mode === 'local') {
        const names = setup.names.slice(0, setup.count).map((n, i) => n.trim() || `Spiller ${i + 1}`);
        if (new Set(names.map(n => n.toLowerCase())).size !== names.length) {
          setupError.value = 'To spillere har samme navn. Giv dem forskellige navne, så statistikken passer.';
          return;
        }
        players = names.map(name => ({ name }));
      } else if (setup.mode === 'ai') {
        const me = setup.myName.trim() || local.name || 'Mig';
        players = [{ name: me }, { name: `Bot (${LEVELS[setup.level].name})`, bot: setup.level }];
      } else {
        if (mySeat.value < 0) {
          setupError.value = 'Vælg hvem denne telefon er.';
          return;
        }
        players = onlineNames.value.map(name => ({ name }));
      }
      setupError.value = '';
      const n = players.length;
      const fresh = {
        ...blankGame(),
        mode: setup.mode,
        order: setup.order,
        legsToWin: setup.legsToWin,
        level: setup.level,
        players,
        legs: players.map(() => 0),
        stats: players.map(freshStats),
        ...freshLeg(n),
        matchId: push(firebaseRef(database, 'history/cricket')).key,
        startedAt: Date.now(),
      };
      clearTimeout(botTimer);
      botBusy.value = false;
      src.value = setup.mode === 'online' ? 'online' : 'local';
      Object.assign(g.value, fresh);
      if (setup.start === 'bull') {
        g.value.phase = 'bull';
        g.value.bull = { results: players.map(() => null), active: players.map(() => true), round: 1 };
        commit();
      } else {
        beginPlay(setup.start === 'p1' ? 1 : 0);
      }
    };

    const beginPlay = (starter) => {
      const s = g.value;
      s.firstStarter = starter;
      s.turn = starter;
      s.phase = 'play';
      commit();
      showFlash();
    };

    // ---------- bulls up
    const bullLabel = BULL_LABEL;
    const bullRes = computed(() => resolveBullMulti(g.value.bull.results || [], g.value.bull.active || []));
    const canBull = (i) => {
      const s = g.value;
      if (s.players[i] && s.players[i].bot) return false;
      if (s.mode === 'online') return i === mySeat.value;
      return true;
    };
    // Online you only see the other result once you have chosen your own.
    const bullVisible = (i) => {
      const s = g.value;
      if (s.mode !== 'online' || i === mySeat.value) return true;
      return !s.bull.active[mySeat.value] || Boolean(s.bull.results[mySeat.value]);
    };
    const setBull = (i, v) => {
      buzz();
      const s = g.value;
      s.bull.results[i] = v;
      if (s.mode === 'ai' && s.bull.active[1] && !s.bull.results[1]) {
        s.bull.results[1] = dartToBull(throwBull(LEVELS[s.level]));
      }
      commit();
    };
    const bullRethrow = () => {
      const s = g.value;
      const tied = bullRes.value.tied || [];
      s.bull = {
        results: s.players.map((p, i) => (tied.includes(i) ? null : s.bull.results[i])),
        active: s.players.map((p, i) => tied.includes(i)),
        round: s.bull.round + 1,
      };
      commit();
    };

    // ---------- derived
    const targets = TARGETS;
    const inGame = computed(() => ['bull', 'play', 'done'].includes(g.value.phase));
    const modeLabel = computed(() => ({ local: 'LOKALT', ai: 'AI', online: 'ONLINE' }[g.value.mode] || ''));
    const ranks = computed(() => (g.value.players.length ? standing(g.value) : []));
    const isBotTurn = computed(() => Boolean(g.value.players[g.value.turn] && g.value.players[g.value.turn].bot));
    const myTurn = computed(() => {
      const s = g.value;
      if (s.mode === 'online') return s.turn === mySeat.value;
      return !isBotTurn.value;
    });
    const canInput = computed(() => g.value.phase === 'play' && !g.value.legOver && myTurn.value && !botBusy.value && !flash.value);
    const turnTag = computed(() => {
      const s = g.value;
      if (s.mode === 'online') return s.turn === mySeat.value ? 'DIN TUR' : 'MODSTANDER';
      if (isBotTurn.value) return 'BOT KASTER';
      return 'DIN TUR';
    });
    const waitText = computed(() => {
      const s = g.value;
      if (s.legOver) return '';
      if (s.mode === 'online' && s.turn !== mySeat.value) return `Venter på at ${s.players[s.turn].name} kaster…`;
      return '';
    });
    const allowed = (t) => targetAllowed(g.value, g.value.turn, t);
    const isDead = (t) => g.value.marks.length > 0 && deadFor(g.value.marks, t);
    const isNextForTurn = (t) => g.value.order === 'strict' && g.value.phase === 'play' && !g.value.legOver
      && g.value.marks.length > 0 && nextStrict(g.value.marks, g.value.turn) === t;
    const markText = (m) => (m >= 3 ? 'lukket' : m === 2 ? '2 markeringer' : m === 1 ? '1 markering' : 'ingen');
    const lastVisitText = computed(() => {
      const p = g.value.prev;
      if (!p || !g.value.players[p.p]) return '';
      const darts = (p.darts || []).map(dartLabel).join(' · ');
      const gave = p.gave ? ` · gav ${p.gave} point` : '';
      return `${g.value.players[p.p].name}: ${darts}${gave}`;
    });

    const statRows = computed(() => {
      const s = g.value;
      const per = (fn) => s.players.map((p, i) => fn(s.stats[i] || freshStats(), i));
      return [
        { label: 'MPR', values: per(st => fmtMpr(st)) },
        { label: 'Markeringer', values: per(st => st.marks) },
        { label: 'Triples', values: per(st => st.triples) },
        { label: 'Givet point', values: per(st => st.given) },
        { label: 'Pile', values: per(st => st.darts) },
      ];
    });

    // ---------- turn flow
    const showFlash = () => {
      const s = g.value;
      if (s.mode !== 'local' || s.phase !== 'play' || s.legOver) return;
      clearTimeout(flashTimer);
      flash.value = { label: turnLabel(s.players[s.turn].name), color: colors[s.turn], points: s.points[s.turn] };
      flashTimer = setTimeout(() => { flash.value = null; }, 1100);
    };

    const saveHistory = () => {
      const s = g.value;
      if (!s.matchId) return;
      const players = {};
      s.players.forEach((p, i) => {
        const st = s.stats[i] || freshStats();
        players[`p${i + 1}`] = {
          name: p.name, legs: s.legs[i], marks: st.marks, visits: st.visits, darts: st.darts, triples: st.triples, given: st.given,
        };
      });
      const record = {
        startedAt: s.startedAt, updatedAt: Date.now(), mode: s.mode, order: s.order, legsToWin: s.legsToWin, players,
      };
      if (s.mode === 'ai') record.level = s.level;
      if (s.phase === 'done') record.winner = s.players[s.lastLegWinner].name;
      set(firebaseRef(database, `history/cricket/${s.matchId}`), record).catch(err => console.error('Kunne ikke gemme kamp:', err));
    };

    const snapshot = () => {
      const s = g.value;
      return JSON.stringify({ by: s.turn, marks: s.marks, points: s.points, turn: s.turn, visit: s.visit, prev: s.prev, stats: s.stats });
    };

    const endVisit = () => {
      const s = g.value;
      s.stats[s.turn].visits += 1;
      s.prev = { p: s.turn, darts: s.visit.slice(), gave: s.visit.reduce((a, d) => a + (d.gave || 0), 0) };
      s.visit = [];
      s.turn = (s.turn + 1) % s.players.length;
      mult.value = 1;
      showFlash();
    };

    const finishLeg = (w) => {
      const s = g.value;
      s.stats[s.turn].visits += 1;
      s.prev = null;
      s.legs[w] += 1;
      s.lastLegWinner = w;
      s.legOver = true;
      s.undo = [];
      if (s.legs[w] >= s.legsToWin) {
        s.phase = 'done';
        confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
      } else {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      }
      saveHistory();
    };

    // One dart for the player whose turn it is. t = 0 is a miss.
    const throwOne = (t, m) => {
      const s = g.value;
      const p = s.turn;
      s.undo.push(snapshot());
      if (s.undo.length > UNDO_MAX) s.undo.splice(0, s.undo.length - UNDO_MAX);
      const res = applyDart(s, p, t, t ? m : 0);
      const st = s.stats[p];
      st.darts += 1;
      st.marks += res.marked;
      if (m === 3 && res.marked > 0) st.triples += 1;
      st.given += res.gave;
      s.visit.push({ t: t || 0, m: t ? m : 0, marked: res.marked, gave: res.gave });
      const w = legWinner(s);
      if (w >= 0) {
        finishLeg(w);
      } else if (s.visit.length >= 3) {
        endVisit();
      }
      commit();
    };

    const enter = (t) => {
      if (!canInput.value) return;
      if (t && (!allowed(t) || (t === 25 && mult.value === 3))) return;
      buzz();
      const m = mult.value;
      mult.value = 1;
      throwOne(t, m);
    };

    const endVisitEarly = () => {
      if (!canInput.value) return;
      const s = g.value;
      while (s.visit.length < 3 && !s.legOver) {
        s.undo.push(snapshot());
        s.stats[s.turn].darts += 1;
        s.visit.push({ t: 0, m: 0, marked: 0, gave: 0 });
      }
      endVisit();
      commit();
    };

    const canUndo = computed(() => {
      const s = g.value;
      if (s.phase !== 'play' || s.legOver || botBusy.value || !s.undo.length) return false;
      if (s.mode === 'online') {
        try { return JSON.parse(s.undo[s.undo.length - 1]).by === mySeat.value; } catch (e) { return false; }
      }
      if (s.mode === 'ai') return s.undo.some(u => { try { return !s.players[JSON.parse(u).by].bot; } catch (e) { return false; } });
      return true;
    });

    const restore = (snap) => {
      const s = g.value;
      const o = JSON.parse(snap);
      Object.assign(s, { marks: o.marks, points: o.points, turn: o.turn, visit: o.visit || [], prev: o.prev || null, stats: o.stats });
    };

    const undoDart = () => {
      if (!canUndo.value) return;
      buzz();
      const s = g.value;
      // Against the bot, step back past its darts to your own last dart.
      let snap = s.undo.pop();
      while (s.mode === 'ai' && s.players[JSON.parse(snap).by].bot && s.undo.length) snap = s.undo.pop();
      restore(snap);
      mult.value = 1;
      commit();
    };

    const nextLeg = () => {
      const s = g.value;
      Object.assign(s, freshLeg(s.players.length));
      s.legNo += 1;
      s.legOver = false;
      s.visit = [];
      s.prev = null;
      s.undo = [];
      s.turn = (s.firstStarter + s.legNo - 1) % s.players.length;
      commit();
      showFlash();
    };

    // ---------- bot
    const runBot = () => {
      const s = g.value;
      if (s.mode !== 'ai' || s.phase !== 'play' || s.legOver || !isBotTurn.value || botBusy.value) return;
      botBusy.value = true;
      const level = cricketLevel(LEVELS[s.level] || LEVELS.pub);
      const step = () => {
        const cur = g.value;
        if (cur.mode !== 'ai' || cur.phase !== 'play' || cur.legOver || !isBotTurn.value) {
          botBusy.value = false;
          return;
        }
        const a = botTarget(cur, cur.turn);
        const hit = dartToCricket(throwDart({ ring: a.ring, n: a.t, value: 0 }, level));
        const turnBefore = cur.turn;
        throwOne(hit.t, hit.m);
        if (cur.turn === turnBefore && !cur.legOver && cur.phase === 'play') {
          botTimer = setTimeout(step, BOT_DELAY);
        } else {
          // Leave the bot's darts visible for a moment before your turn.
          botTimer = setTimeout(() => { botBusy.value = false; }, 250);
        }
      };
      botTimer = setTimeout(step, BOT_DELAY);
    };
    watch(() => [g.value.turn, g.value.phase, g.value.legOver, g.value.legNo, src.value], () => runBot(), { immediate: true });

    // ---------- end / restart
    const rematch = () => {
      const s = g.value;
      Object.assign(setup, { mode: s.mode, order: s.order, legsToWin: s.legsToWin, level: s.level });
      if (s.mode === 'local') Object.assign(setup, { count: s.players.length, names: [...s.players.map(p => p.name), '', '', ''].slice(0, 4) });
      if (s.mode === 'ai') setup.myName = s.players[0].name;
      startMatch();
    };
    const quitMatch = async (silent) => {
      const s = g.value;
      if (!silent && !(await showConfirm('Kampen er gemt i historikken, som den står nu.', { title: 'Afslut kamp?', confirmText: 'Afslut' }))) return;
      clearTimeout(botTimer);
      clearTimeout(flashTimer);
      botBusy.value = false;
      flash.value = null;
      if (s.phase === 'play' && s.stats.some(st => st.darts > 0)) saveHistory();
      setup.mode = s.mode || setup.mode;
      Object.assign(s, blankGame(), { mode: s.mode });
      commit();
    };

    onUnmounted(() => {
      clearTimeout(flashTimer);
      clearTimeout(botTimer);
      if (stopOnline) stopOnline();
    });

    return {
      g, setup, local, setupError, suggestions, backLink, colors, levelList, mprHint: MPR_HINT, onlineNames, mySeat,
      starterOptions, mult, flash, bullLabel, bullRes, targets, inGame, modeLabel, ranks, canInput, turnTag, waitText,
      lastVisitText, statRows, canUndo,
      setMode, shuffle, addName, startMatch, beginPlay, canBull, bullVisible, setBull, bullRethrow,
      allowed, isDead, isNextForTurn, markText, targetName, dartLabel, enter, endVisitEarly, undoDart, nextLeg, rematch, quitMatch,
    };
  },
};
</script>

<style scoped>
.cricket {
  color: var(--text);
  font-family: 'Barlow', system-ui, sans-serif;
  padding: 16px 16px 40px;
  box-sizing: border-box;
}

.cricket *,
.cricket *::before,
.cricket *::after {
  box-sizing: border-box;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: default;
}

.wrap {
  max-width: 460px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
}

.page-title {
  margin: 0;
  flex: 1;
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

.pill {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--display);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.06em;
  color: var(--muted);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 6px 10px;
  white-space: nowrap;
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  flex: 0 0 10px;
  border-radius: 50%;
  background: var(--c);
}

/* ---------- setup */
.setup {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-label {
  font-family: var(--display);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}

.link-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
}

.names {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.name-input {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 54px;
  padding: 0 14px;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: inset 4px 0 0 var(--c);
}

.name-input:focus-within {
  border-color: var(--c);
}

.name-input input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--text);
  font-family: var(--display);
  font-weight: 700;
  font-size: 22px;
  outline: none;
}

.name-input input::placeholder {
  color: var(--placeholder);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.chips-label {
  font-size: 12px;
  color: var(--muted);
  margin-right: 2px;
}

.chip {
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--key);
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
}

.error {
  margin: 0;
  color: var(--danger);
  font-size: 14px;
  font-weight: 600;
}

.help {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.4;
}

.segmented {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 4px;
  background: var(--surface);
  border-radius: 12px;
  padding: 4px;
}

.segmented button {
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
}

.segmented button.selected {
  background: var(--accent);
  color: var(--on-accent);
}

.levels {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.level {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--text);
  text-align: left;
}

.level.selected {
  border-color: var(--accent);
  box-shadow: inset 0 0 0 1px var(--accent);
}

.level-name {
  font-family: var(--display);
  font-weight: 800;
  font-size: 20px;
  text-transform: uppercase;
}

.level-avg {
  font-size: 13px;
  color: var(--muted);
}

.online-card {
  background: var(--surface);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.online-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.online-name {
  font-family: var(--display);
  font-weight: 700;
  font-size: 20px;
  text-transform: uppercase;
}

.me-tag {
  margin-left: auto;
  font-family: var(--display);
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--c);
  border: 1px solid var(--c);
  border-radius: 999px;
  padding: 1px 7px;
}

.primary-btn {
  height: 58px;
  border: 0;
  border-radius: 12px;
  background: var(--accent);
  color: var(--on-accent);
  font-family: var(--display);
  font-weight: 800;
  font-size: 22px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.ghost-btn {
  height: 48px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: transparent;
  color: var(--text);
  font-size: 15px;
  font-weight: 600;
}

.rules {
  background: var(--surface);
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 14px;
  color: var(--soft);
}

.rules summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--text);
}

.rules ul {
  margin: 10px 0 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  line-height: 1.4;
}

/* ---------- bulls up */
.bull {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
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
  border-radius: 14px;
  background: var(--surface);
  box-shadow: inset 4px 0 0 var(--c);
}

.bull-row.out {
  opacity: 0.55;
}

.bull-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--display);
  font-weight: 700;
  font-size: 18px;
  text-transform: uppercase;
}

.bull-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.bull-options button {
  height: 46px;
  border: 0;
  border-radius: 10px;
  background: var(--key);
  color: var(--text);
  font-family: var(--display);
  font-weight: 700;
  font-size: 18px;
}

.bull-result {
  align-self: flex-start;
  font-family: var(--display);
  font-weight: 800;
  font-size: 20px;
  padding: 3px 12px;
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

.bull-wait {
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
  margin: 4px 0 0;
  color: var(--soft);
}

.bull-status .bull-winner {
  font-family: var(--display);
  font-weight: 800;
  font-size: 26px;
  text-transform: uppercase;
  color: var(--text);
}

/* ---------- banners */
.banner {
  background: var(--c);
  color: var(--on-accent);
  font-family: var(--display);
  font-weight: 800;
  font-size: 22px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: 12px;
  padding: 8px 8px 8px 16px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.next-leg {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 14px;
  border: 0;
  border-radius: 9px;
  background: var(--bg);
  color: var(--text);
  font-family: var(--display);
  font-weight: 700;
  font-size: 17px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* ---------- turn card */
.turn-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px 10px 14px;
  border-radius: 16px;
  background: var(--surface);
  background: color-mix(in srgb, var(--c) 16%, var(--surface));
  border: 2px solid var(--c);
}

.turn-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.turn-tag {
  align-self: flex-start;
  background: var(--c);
  color: var(--on-accent);
  font-family: var(--display);
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 0.12em;
  padding: 2px 9px;
  border-radius: 999px;
}

.turn-name {
  font-family: var(--display);
  font-weight: 800;
  font-size: 26px;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.visit {
  display: flex;
  gap: 6px;
  flex: 0 0 auto;
}

.visit-dart {
  width: 50px;
  height: 40px;
  border-radius: 9px;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--display);
  font-weight: 800;
  font-size: 18px;
  color: var(--muted);
}

.visit-dart.empty {
  border: 1px dashed var(--line);
  background: transparent;
}

.visit-dart.hit {
  color: var(--text);
}

.last-visit {
  margin: -4px 0 0;
  font-size: 13px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wait-text {
  margin: 0;
  text-align: center;
  font-size: 14px;
  color: var(--soft);
}

/* ---------- board */
.board {
  background: var(--surface);
  border-radius: 14px;
  padding: 4px 6px;
  font-variant-numeric: tabular-nums;
}

.b-row {
  display: grid;
  grid-template-columns: 52px repeat(var(--cols), minmax(0, 1fr));
  align-items: stretch;
  border-bottom: 1px solid var(--line2);
}

.b-row:last-child {
  border-bottom: 0;
}

.b-num {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--display);
  font-weight: 800;
  font-size: 22px;
}

.b-row.dead .b-num {
  color: var(--faint);
  text-decoration: line-through;
}

.b-row.dead .b-cell {
  opacity: 0.4;
}

.b-row.next .b-num {
  color: var(--accent);
}

.b-player,
.b-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  border-radius: 8px;
}

.b-player.active,
.b-cell.active {
  background: color-mix(in srgb, var(--c) 14%, transparent);
}

.b-player {
  padding: 6px 2px;
  gap: 1px;
}

.b-pname {
  display: flex;
  align-items: center;
  gap: 5px;
  max-width: 100%;
  font-family: var(--display);
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  color: var(--soft);
  white-space: nowrap;
  overflow: hidden;
}

.b-pname .dot {
  width: 8px;
  height: 8px;
  flex-basis: 8px;
}

.b-points {
  font-family: var(--display);
  font-weight: 800;
  font-size: 30px;
  line-height: 1.05;
}

.b-legs {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  white-space: nowrap;
}

.b-cell {
  height: 34px;
}

.mark {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: var(--c);
  stroke-width: 2.6;
  stroke-linecap: round;
}

/* ---------- input */
.mult {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  background: var(--surface);
  border-radius: 12px;
  padding: 4px;
}

.mult button {
  height: 42px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--muted);
  font-family: var(--display);
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.mult button.selected {
  background: var(--accent);
  color: var(--on-accent);
}

.mult button:disabled {
  opacity: 0.5;
}

.keypad {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.key {
  height: 56px;
  border: 0;
  border-radius: 12px;
  background: var(--key);
  color: var(--text);
  font-family: var(--display);
  font-size: 26px;
  font-weight: 700;
}

.key:disabled {
  opacity: 0.35;
}

.key.next {
  box-shadow: inset 0 0 0 2px var(--accent);
}

.key.miss {
  background: var(--key2);
  font-size: 18px;
  letter-spacing: 0.08em;
  color: var(--soft);
}

.actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.actions button {
  height: 46px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: transparent;
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
}

.actions button:disabled {
  opacity: 0.4;
}

.actions button.danger {
  color: var(--danger);
}

/* ---------- stats */
.stats-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.section-title {
  margin: 0;
  font-family: var(--display);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.14em;
  color: var(--muted);
}

.stats {
  background: var(--surface);
  border-radius: 14px;
  padding: 4px 12px;
  font-variant-numeric: tabular-nums;
}

.stats-row {
  display: grid;
  grid-template-columns: minmax(90px, 1fr) repeat(var(--cols), minmax(0, 1fr));
  gap: 6px;
  padding: 9px 0;
  border-bottom: 1px solid var(--line2);
  font-size: 14px;
}

.stats-row:last-child {
  border-bottom: 0;
}

.stats-row span:not(:first-child) {
  text-align: right;
}

.stats-row span:first-child {
  color: var(--soft);
}

.stats-row.head span {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  font-family: var(--display);
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
}

.stats-row.head .dot {
  width: 8px;
  height: 8px;
  flex-basis: 8px;
}

.end-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ---------- turn flash */
.turn-flash {
  position: fixed;
  inset: 0;
  z-index: 30;
  border: 0;
  background: var(--c);
  color: var(--on-accent);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 24px;
  text-align: center;
}

.tf-name {
  font-family: var(--display);
  font-weight: 800;
  font-size: clamp(40px, 13vw, 72px);
  line-height: 1;
  text-transform: uppercase;
}

.tf-score {
  font-family: var(--display);
  font-weight: 800;
  font-size: clamp(32px, 10vw, 56px);
  line-height: 1;
  opacity: 0.85;
}

.flash-enter-active,
.flash-leave-active {
  transition: opacity 0.18s ease;
}

.flash-enter-from,
.flash-leave-to {
  opacity: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>

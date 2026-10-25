<template>
  <div class="local">
    <div class="wrap">
      <header class="topbar">
        <router-link :to="backLink" class="icon-link" aria-label="Tilbage til scoreboard" title="Tilbage">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        </router-link>
        <h1 class="page-title">LOKALT</h1>
        <div v-if="g.phase === 'play' || g.phase === 'done'" class="pill">{{ g.startScore }} · LEG {{ g.legNo }} · TIL {{ g.legsToWin }}</div>
      </header>

      <!-- ===================== SETUP ===================== -->
      <section v-if="g.phase === 'setup'" class="setup">
        <div class="field">
          <span class="field-label">Antal spillere</span>
          <div class="segmented">
            <button v-for="n in [2, 3, 4]" :key="n" type="button" :class="{ selected: setup.count === n }" @click="setCount(n)">{{ n }}</button>
          </div>
        </div>

        <div v-if="setup.count === 4" class="row-toggle">
          <div class="row-text">
            <span class="row-label">Spil hold, 2 mod 2</span>
            <span class="help">Spiller 1 og 2 mod spiller 3 og 4. Holdkammerater skiftes til at kaste og deler score.</span>
          </div>
          <button type="button" role="switch" class="switch" :aria-checked="setup.teams ? 'true' : 'false'" aria-label="Spil hold" @click="setup.teams = !setup.teams"><span></span></button>
        </div>

        <div class="field">
          <div class="field-head">
            <span class="field-label">{{ setup.teams && setup.count === 4 ? 'Hold' : 'Spillere' }}</span>
            <button type="button" class="link-btn" @click="shuffle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>
              Bland
            </button>
          </div>
          <div class="names">
            <template v-for="(p, i) in setup.names.slice(0, setup.count)" :key="'n' + i">
              <span v-if="setup.teams && setup.count === 4 && (i === 0 || i === 2)" class="team-label" :style="{ '--c': colorFor(i) }">{{ i === 0 ? 'HOLD A' : 'HOLD B' }}</span>
              <label class="name-input" :style="{ '--c': colorFor(i) }">
                <span class="dot" aria-hidden="true"></span>
                <span class="sr-only">Navn på spiller {{ i + 1 }}</span>
                <input v-model="setup.names[i]" type="text" maxlength="16" :placeholder="`Spiller ${i + 1}`" autocomplete="off">
              </label>
            </template>
          </div>
          <div v-if="suggestions.length" class="chips">
            <span class="chips-label">Tidligere:</span>
            <button v-for="n in suggestions" :key="'s' + n" type="button" class="chip" @click="addName(n)">{{ n }}</button>
          </div>
          <p v-if="setupError" class="error" role="alert">{{ setupError }}</p>
        </div>

        <div class="field">
          <span class="field-label">Spil</span>
          <div class="segmented">
            <button v-for="sc in [201, 301, 501, 701, 1000]" :key="sc" type="button" :class="{ selected: setup.startScore === sc }" @click="setup.startScore = sc">{{ sc }}</button>
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
            <button type="button" :class="{ selected: setup.startMode === 'bull' }" @click="setup.startMode = 'bull'">Bull om start</button>
            <button type="button" :class="{ selected: setup.startMode === 'order' }" @click="setup.startMode = 'order'">Som skrevet</button>
          </div>
        </div>

        <button type="button" class="primary-btn" @click="startMatch">Start kamp</button>
      </section>

      <!-- ===================== GAME ===================== -->
      <template v-else>
        <!-- Bulls up for 2-4 sides -->
        <div v-if="g.phase === 'bull'" class="bull">
          <div class="bull-head">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg>
            <div>
              <h2 class="bull-title">Bull om start</h2>
              <p class="bull-round">Runde {{ g.bull.round }}{{ g.bull.round > 1 ? ' · kun dem der stod lige' : '' }}</p>
            </div>
          </div>
          <div v-for="(side, i) in g.sides" :key="'b' + i" class="bull-row" :class="{ out: !g.bull.active[i] }" :style="{ '--c': side.color }">
            <span class="bull-name"><span class="dot" aria-hidden="true"></span>{{ bullThrowerName(i) }}</span>
            <div v-if="g.bull.active[i] && !g.bull.results[i]" class="bull-options" role="group" :aria-label="`Hvor ramte ${bullThrowerName(i)}?`">
              <button v-for="opt in ['bull', '25', 'out']" :key="opt" type="button" @click="setBull(i, opt)">{{ bullLabel[opt] }}</button>
            </div>
            <span v-else-if="g.bull.results[i]" class="bull-result" :class="'r-' + g.bull.results[i]">{{ bullLabel[g.bull.results[i]] }}</span>
            <span v-else class="bull-wait">Venter</span>
          </div>
          <div class="bull-status" aria-live="polite">
            <p v-if="bullRes.status === 'waiting'">Kast én pil hver mod bull, og tryk hvor den landede.</p>
            <template v-else-if="bullRes.status === 'rethrow'">
              <p>Lige mellem {{ bullRes.tied.map(i => g.sides[i].name).join(' og ') }}. De kaster om!</p>
              <button type="button" class="primary-btn" @click="bullRethrow">Kast om</button>
            </template>
            <template v-else>
              <p class="bull-winner">{{ g.sides[bullRes.winner].name }} starter!</p>
              <button type="button" class="primary-btn" @click="bullStart(bullRes.winner)">Start kamp</button>
            </template>
          </div>
          <button type="button" class="ghost-btn" @click="toSetup">Annuller</button>
        </div>

        <template v-else>
          <div v-if="g.phase === 'done'" class="banner" :style="{ '--c': g.sides[g.lastLegWinner].color }">
            <span>{{ g.sides[g.lastLegWinner].name }} vandt kampen!</span>
          </div>
          <div v-else-if="g.legOver" class="banner" :style="{ '--c': g.sides[g.lastLegWinner].color }">
            <span>{{ g.sides[g.lastLegWinner].name }} vandt leg {{ g.legNo }}</span>
            <button type="button" class="next-leg" @click="nextLeg">
              Næste leg
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          </div>

          <!-- Whose turn: big card in the side's colour -->
          <section v-if="g.phase === 'play' && !g.legOver" class="active-card" :style="{ '--c': current.color }" aria-live="polite">
            <div class="active-top">
              <span class="turn-tag">DIN TUR</span>
              <span class="rank-chip">{{ ranks[g.turnSide] }}.</span>
            </div>
            <div class="active-name">{{ currentThrowerName }}</div>
            <div v-if="current.members.length > 1" class="active-team">{{ current.name }}</div>
            <div class="active-main">
              <div class="active-score">{{ g.remaining[g.turnSide] }}</div>
              <div v-if="hint(g.turnSide)" class="active-co">
                <span class="co-label">CHECKOUT</span>
                <span class="co-value">{{ hint(g.turnSide) }}</span>
              </div>
            </div>
            <div class="active-meta">
              <span>AVG <strong>{{ playerAvg(currentThrower) }}</strong></span>
              <span>LEGS <strong>{{ g.legs[g.turnSide] }}</strong></span>
              <span class="recent">
                <span v-for="(v, i) in recent(g.turnSide)" :key="i" :class="{ first: i === 0 }">{{ v }}</span>
              </span>
            </div>
          </section>

          <!-- Everyone else, in turn order, with live standing -->
          <ol class="queue" aria-label="Rækkefølge og stilling">
            <li v-for="(s, pos) in queue" :key="'q' + s" class="q-row" :class="{ next: pos === 0 && g.phase === 'play' && !g.legOver }" :style="{ '--c': g.sides[s].color }">
              <span class="q-rank">{{ ranks[s] }}.</span>
              <span class="dot" aria-hidden="true"></span>
              <span class="q-name">{{ g.sides[s].name }}</span>
              <span v-if="pos === 0 && g.phase === 'play' && !g.legOver" class="q-next">NÆSTE</span>
              <span class="q-score">{{ g.remaining[s] }}</span>
              <span class="q-legs">{{ g.legs[s] }}</span>
            </li>
          </ol>

          <template v-if="g.phase === 'play'">
            <div class="input-row">
              <label class="score-field" :class="{ off: !canEnter }" :style="{ '--c': current.color }">
                <span class="score-label">SCORE</span>
                <input v-model="currentScore" type="number" inputmode="none" placeholder="0" aria-label="Score" :disabled="!canEnter" @keyup.enter="submit">
              </label>
              <VoiceInput v-if="voice.enabled.value" :voice="voice" />
              <button class="key delete" type="button" aria-label="Slet sidste tal" :disabled="!canEnter" @click="del">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z" /><path d="M17 9l-5 6M12 9l5 6" /></svg>
              </button>
            </div>
            <div class="keypad">
              <button v-for="n in [7, 8, 9, 4, 5, 6, 1, 2, 3]" :key="n" class="key" type="button" :disabled="!canEnter" @click="press(n)">{{ n }}</button>
              <button class="key" type="button" :disabled="!canEnter" @click="press(0)">0</button>
              <button class="key enter" type="button" :disabled="!canEnter" :style="{ '--c': current.color }" @click="submit">ENTER</button>
            </div>
            <div class="actions">
              <button type="button" :disabled="!g.undo.length || g.legOver" @click="undoVisit">Fortryd runde</button>
              <button type="button" class="danger" @click="quitMatch">Afslut kamp</button>
            </div>
          </template>

          <section class="stats-block">
            <h2 class="section-title">STATS</h2>
            <div class="stats" :style="{ '--cols': g.players.length }">
              <div class="stats-row head">
                <span></span>
                <span v-for="(p, i) in g.players" :key="'h' + i" :style="{ '--c': g.sides[sideOfPlayer(i)].color }"><span class="dot" aria-hidden="true"></span>{{ p.name }}</span>
              </div>
              <div v-for="row in statRows" :key="row.label" class="stats-row">
                <span>{{ row.label }}</span>
                <span v-for="(v, i) in row.values" :key="row.label + i">{{ v }}</span>
              </div>
            </div>
          </section>

          <div v-if="g.phase === 'done'" class="end-actions">
            <button type="button" class="primary-btn" @click="rematch">Omkamp</button>
            <button type="button" class="ghost-btn" @click="toSetup">Ny opsætning</button>
          </div>
        </template>
      </template>
    </div>

    <!-- Turn change flash -->
    <transition name="flash">
      <button v-if="flash" type="button" class="turn-flash" :style="{ '--c': flash.color }" @click="flash = null">
        <span class="tf-name">{{ flash.label }}</span>
        <span class="tf-score">{{ flash.score }}</span>
      </button>
    </transition>

    <!-- Darts at double -->
    <div v-if="pendingDouble" class="sheet-backdrop">
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="lg-sheet-title">
        <h2 id="lg-sheet-title" class="sheet-title">{{ pendingDouble.checkout ? 'Checkout!' : 'Darts på double?' }}</h2>
        <p class="sheet-sub">{{ g.players[pendingDouble.player].name }}{{ pendingDouble.checkout ? ': hvor mange darts kastede du på double?' : ` stod på ${pendingDouble.before}. Hvor mange darts på double?` }}</p>
        <div class="sheet-options">
          <button v-for="n in (pendingDouble.checkout ? [1, 2, 3] : [0, 1, 2, 3])" :key="n" type="button" @click="answerDouble(n)">{{ n }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { getDatabase, ref as firebaseRef, set, push, get } from 'firebase/database';
import confetti from 'canvas-confetti';
import getDartsCheckout from '@/getDartsCheckout';
import { humanVisitResult } from '@/ai/dartBot';
import { BULL_LABEL } from '@/bullsUp';
import { buildPlayerSnapshot, matchList, playerNames } from '@/matchHistory';
import { showAlert, showConfirm, dialogState } from '@/dialog';
import { local, shared, buzz } from '@/settings';
import { useVoiceInput } from '@/useVoiceInput';
import VoiceInput from '@/components/VoiceInput.vue';
import {
  makeSides, sideStarterForLeg, throwerOf, standings, resolveBullMulti, turnLabel, SIDE_COLORS,
} from '@/localGame';

const STORE_KEY = 'borgdart_local_v1';
const load = (fallback) => {
  try { const v = localStorage.getItem(STORE_KEY); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
};
const save = (v) => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(v)); } catch (e) { /* storage unavailable */ }
};
const freshPlayerStats = () => ({ visits: [], doubleDarts: [], legDarts: [], checkouts: [], highestCheckout: 0 });

export default {
  components: { VoiceInput },
  setup() {
    const route = useRoute();
    const database = getDatabase();
    const backLink = computed(() => ({ path: '/', query: route.query }));
    const saved = load(null);

    const setup = reactive({
      count: 3,
      names: ['', '', '', ''],
      teams: false,
      startScore: 501,
      legsToWin: 2,
      startMode: 'bull',
      ...(saved && saved.setup ? saved.setup : {}),
    });
    if (!setup.names.some(Boolean) && local.name) setup.names[0] = local.name;

    const blankGame = () => ({
      phase: 'setup', players: [], teams: null, sides: [], startScore: 501, legsToWin: 2, startMode: 'bull',
      remaining: [], legs: [], legNo: 1, firstStarter: 0, turnSide: 0, sideThrows: [], sideRecent: [],
      playerStats: [], legOver: false, lastLegWinner: 0, undo: [], matchId: null, startedAt: null,
      bull: { results: [], active: [], round: 1 },
    });
    const g = reactive(saved && saved.game ? { ...blankGame(), ...saved.game } : blankGame());
    watch([g, setup], () => save({ game: g, setup }), { deep: true });

    const currentScore = ref('');
    const pendingDouble = ref(null);
    const flash = ref(null);
    const setupError = ref('');
    let flashTimer = null;

    // ---------- setup
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
    const setCount = (n) => { setup.count = n; if (n !== 4) setup.teams = false; };
    const shuffle = () => {
      const arr = setup.names.slice(0, setup.count);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      arr.forEach((n, i) => { setup.names[i] = n; });
    };
    const colorFor = (i) => (setup.teams && setup.count === 4 ? SIDE_COLORS[i < 2 ? 0 : 1] : SIDE_COLORS[i]);

    const startMatch = () => {
      const names = setup.names.slice(0, setup.count).map((n, i) => n.trim() || `Spiller ${i + 1}`);
      const lower = names.map(n => n.toLowerCase());
      if (new Set(lower).size !== lower.length) {
        setupError.value = 'To spillere har samme navn. Giv dem forskellige navne, så statistikken passer.';
        return;
      }
      setupError.value = '';
      const players = names.map(name => ({ name }));
      const teams = setup.teams && players.length === 4;
      const sides = makeSides(players, teams);
      Object.assign(g, blankGame(), {
        players,
        teams: teams ? [[0, 1], [2, 3]] : null,
        sides,
        startScore: setup.startScore,
        legsToWin: setup.legsToWin,
        startMode: setup.startMode,
        remaining: sides.map(() => setup.startScore),
        legs: sides.map(() => 0),
        sideThrows: sides.map(() => 0),
        sideRecent: sides.map(() => []),
        playerStats: players.map(freshPlayerStats),
        matchId: push(firebaseRef(database, 'history/matches')).key,
        startedAt: Date.now(),
      });
      if (setup.startMode === 'bull') {
        g.phase = 'bull';
        g.bull = { results: sides.map(() => null), active: sides.map(() => true), round: 1 };
      } else {
        beginPlay(0);
      }
    };

    const beginPlay = (starter) => {
      g.firstStarter = starter;
      g.turnSide = starter;
      g.phase = 'play';
      showFlash();
    };

    // ---------- bulls up
    const bullLabel = BULL_LABEL;
    const bullRes = computed(() => resolveBullMulti(g.bull.results || [], g.bull.active || []));
    const bullThrowerName = (i) => {
      const side = g.sides[i];
      if (!side) return '';
      return side.members.length > 1 ? `${side.name.split(' & ')[0]} (${side.name})` : side.name;
    };
    const setBull = (i, v) => { buzz(); g.bull.results[i] = v; };
    const bullRethrow = () => {
      const tied = bullRes.value.tied || [];
      g.bull = {
        results: g.sides.map((s, i) => (tied.includes(i) ? null : g.bull.results[i])),
        active: g.sides.map((s, i) => tied.includes(i)),
        round: g.bull.round + 1,
      };
    };
    const bullStart = (winner) => beginPlay(winner);

    // ---------- derived state
    const current = computed(() => g.sides[g.turnSide] || { color: SIDE_COLORS[0], members: [0], name: '' });
    const currentThrower = computed(() => (g.sides.length ? throwerOf(current.value, g.sideThrows[g.turnSide] || 0, g.legNo) : 0));
    const currentThrowerName = computed(() => (g.players[currentThrower.value] || {}).name || '');
    const ranks = computed(() => standings(g.legs, g.remaining));
    const queue = computed(() => {
      const n = g.sides.length;
      const out = [];
      if (g.phase === 'play' && !g.legOver) {
        for (let k = 1; k < n; k++) out.push((g.turnSide + k) % n);
      } else {
        // Between legs / after the match: show everyone by standing.
        for (let i = 0; i < n; i++) out.push(i);
        out.sort((a, b) => ranks.value[a] - ranks.value[b]);
      }
      return out;
    });
    const sideOfPlayer = (p) => Math.max(0, g.sides.findIndex(s => s.members.includes(p)));
    const canEnter = computed(() => g.phase === 'play' && !g.legOver && !pendingDouble.value && !flash.value);

    const hint = (s) => {
      if (!shared.checkoutHints) return '';
      const r = g.remaining[s];
      if (r > 170 || r < 2) return '';
      const c = getDartsCheckout(r);
      return !c || c === 'No checkout' ? '' : c.split(',').map(x => x.trim()).join(' · ');
    };
    const recent = (s) => (g.sideRecent[s] || []).slice(-3).reverse();
    const sum = (a) => a.reduce((x, y) => x + y, 0);
    const playerAvg = (p) => {
      const v = (g.playerStats[p] || {}).visits || [];
      if (!v.length) return '–';
      const a = (sum(v) / v.length);
      return a % 1 === 0 ? String(a) : a.toFixed(1);
    };
    const statRows = computed(() => {
      const per = (fn) => g.players.map((p, i) => fn(g.playerStats[i] || freshPlayerStats(), i));
      return [
        { label: 'Gns.', values: per((s, i) => playerAvg(i)) },
        { label: '180', values: per(s => s.visits.filter(v => v === 180).length) },
        { label: '100+', values: per(s => s.visits.filter(v => v >= 100).length) },
        { label: 'Checkout %', values: per(s => { const d = sum(s.doubleDarts); return d ? `${Math.round(s.checkouts.length / d * 100)}%` : '–'; }) },
        { label: 'Bedste leg', values: per(s => (s.legDarts.length ? Math.min(...s.legDarts) : '–')) },
      ];
    });

    // ---------- turn flow
    const showFlash = () => {
      if (g.phase !== 'play' || g.legOver) return;
      clearTimeout(flashTimer);
      flash.value = { label: turnLabel(currentThrowerName.value), color: current.value.color, score: g.remaining[g.turnSide] };
      flashTimer = setTimeout(() => { flash.value = null; }, 1100);
    };

    const saveHistory = () => {
      if (!g.matchId) return;
      const players = {};
      g.players.forEach((p, i) => {
        const st = g.playerStats[i];
        players[`p${i + 1}`] = buildPlayerSnapshot({
          name: p.name,
          legs: g.legs[sideOfPlayer(i)],
          setScores: st.visits,
          highestCheckout: st.highestCheckout,
          checkouts: st.checkouts,
          doubleDarts: st.doubleDarts,
          legDarts: st.legDarts,
        });
      });
      const record = { startedAt: g.startedAt, updatedAt: Date.now(), startScore: g.startScore, mode: 'local', players };
      if (g.teams) record.teams = g.teams;
      set(firebaseRef(database, `history/matches/${g.matchId}`), record).catch(err => console.error('Kunne ikke gemme kamp:', err));
    };

    const advanceTurn = () => {
      g.turnSide = (g.turnSide + 1) % g.sides.length;
      if (!pendingDouble.value) showFlash();
    };

    const finishLeg = (side) => {
      g.legs[side] += 1;
      g.lastLegWinner = side;
      g.legOver = true;
      g.undo = [];
      saveHistory();
      if (g.legs[side] >= g.legsToWin) {
        g.phase = 'done';
        confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
      } else {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      }
    };

    const nextLeg = () => {
      g.legNo += 1;
      g.legOver = false;
      g.remaining = g.sides.map(() => g.startScore);
      g.sideThrows = g.sides.map(() => 0);
      g.sideRecent = g.sides.map(() => []);
      g.undo = [];
      g.turnSide = sideStarterForLeg(g.firstStarter, g.legNo, g.sides.length);
      showFlash();
    };

    const press = (n) => {
      if (!canEnter.value || String(currentScore.value).length >= 3) return;
      buzz();
      currentScore.value = `${currentScore.value}${n}`;
    };
    const del = () => { buzz(); currentScore.value = String(currentScore.value).slice(0, -1); };

    const submit = async () => {
      if (!canEnter.value) return;
      buzz();
      const raw = String(currentScore.value).trim();
      const scored = raw === '' ? 0 : parseInt(raw, 10);
      if (Number.isNaN(scored) || scored < 0) return;
      if (scored > 180) {
        currentScore.value = '';
        await showAlert('En runde kan højst give 180 point.', { title: 'Duuude' });
        return;
      }
      currentScore.value = '';
      const side = g.turnSide;
      const player = currentThrower.value;
      const before = g.remaining[side];
      const st = g.playerStats[player];
      const askable = shared.askDoubles && before <= 50 && before > 1;
      const result = shared.doubleOut ? humanVisitResult(before, scored) : (before - scored < 0 ? 'bust' : (before - scored === 0 ? 'checkout' : 'ok'));
      const isBust = result === 'bust';

      st.visits.push(isBust ? 0 : scored);
      st.doubleDarts.push(0);
      g.sideRecent[side].push(isBust ? 'B' : scored);
      g.sideThrows[side] += 1;
      g.undo.push({ side, player, before, wasBust: isBust });

      if (isBust) {
        await showAlert(`${g.players[player].name} havde ${before} tilbage. ${scored} giver bust, så runden tæller 0.`, { title: 'Bust!' });
        if (askable) pendingDouble.value = { player, before, checkout: false };
        saveHistory();
        advanceTurn();
        return;
      }
      g.remaining[side] = before - scored;
      if (result === 'checkout') {
        st.legDarts.push(g.sideRecent[side].length * 3);
        st.checkouts.push(before);
        st.highestCheckout = Math.max(st.highestCheckout, before);
        if (shared.askDoubles) pendingDouble.value = { player, before, checkout: true };
        finishLeg(side);
        return;
      }
      if (askable) pendingDouble.value = { player, before, checkout: false };
      saveHistory();
      advanceTurn();
    };

    const answerDouble = (n) => {
      const p = pendingDouble.value;
      if (!p) return;
      pendingDouble.value = null;
      const dd = g.playerStats[p.player].doubleDarts;
      if (dd.length) dd[dd.length - 1] = n;
      saveHistory();
      showFlash();
    };

    const undoVisit = async () => {
      const last = g.undo[g.undo.length - 1];
      if (!last || g.legOver) return;
      const name = g.players[last.player].name;
      if (!(await showConfirm(`${name}s sidste runde fjernes, og turen går tilbage.`, { title: 'Fortryd runde?', confirmText: 'Fortryd' }))) return;
      g.undo.pop();
      const st = g.playerStats[last.player];
      st.visits.pop();
      st.doubleDarts.pop();
      g.sideRecent[last.side].pop();
      g.sideThrows[last.side] -= 1;
      g.remaining[last.side] = last.before;
      g.turnSide = last.side;
      saveHistory();
    };

    const rematch = () => {
      Object.assign(setup, {
        count: g.players.length,
        names: [...g.players.map(p => p.name), '', '', ''].slice(0, 4),
        teams: Boolean(g.teams),
        startScore: g.startScore,
        legsToWin: g.legsToWin,
        startMode: g.startMode,
      });
      startMatch();
    };
    const toSetup = () => {
      clearTimeout(flashTimer);
      flash.value = null;
      pendingDouble.value = null;
      Object.assign(g, blankGame());
    };
    const quitMatch = async () => {
      if (await showConfirm('Kampen er gemt i historikken, som den står nu.', { title: 'Afslut kamp?', confirmText: 'Afslut' })) toSetup();
    };

    // ---------- voice
    const voice = useVoiceInput({
      canScore: () => canEnter.value && !dialogState.open,
      onScore: (n) => { currentScore.value = String(n); submit(); },
      sheetOpen: () => Boolean(pendingDouble.value),
      onDarts: (n) => answerDouble(n),
    });

    onUnmounted(() => clearTimeout(flashTimer));

    return {
      g, setup, setupError, suggestions, backLink, currentScore, pendingDouble, flash, bullLabel, bullRes, current,
      currentThrower, currentThrowerName, ranks, queue, canEnter, statRows, voice,
      setCount, shuffle, addName, colorFor, startMatch, bullThrowerName, setBull, bullRethrow, bullStart,
      hint, recent, playerAvg, sideOfPlayer, press, del, submit, answerDouble, undoVisit, nextLeg, rematch, toSetup, quitMatch,
    };
  },
};
</script>

<style scoped>
.local {
  color: var(--text);
  font-family: 'Barlow', system-ui, sans-serif;
  padding: 16px 16px 40px;
  box-sizing: border-box;
}

.local *,
.local *::before,
.local *::after {
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
  gap: 14px;
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

.team-label {
  margin-top: 4px;
  font-family: var(--display);
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.12em;
  color: var(--c);
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

.row-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  background: var(--surface);
  border-radius: 14px;
  padding: 12px 14px;
}

.row-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row-label {
  font-weight: 600;
}

.help {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.4;
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

/* ---------- active player */
.active-card {
  position: relative;
  border-radius: 20px;
  padding: 14px 18px 16px;
  background: var(--surface);
  background: color-mix(in srgb, var(--c) 16%, var(--surface));
  border: 2px solid var(--c);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.active-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.turn-tag {
  background: var(--c);
  color: var(--on-accent);
  font-family: var(--display);
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.12em;
  padding: 3px 10px;
  border-radius: 999px;
}

.rank-chip {
  font-family: var(--display);
  font-weight: 800;
  font-size: 16px;
  color: var(--muted);
}

.active-name {
  margin-top: 4px;
  font-family: var(--display);
  font-weight: 800;
  font-size: 34px;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active-team {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
}

.active-main {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-top: 2px;
}

.active-score {
  font-family: var(--display);
  font-weight: 800;
  font-size: clamp(84px, 28vw, 112px);
  line-height: 0.85;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.active-co {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  padding-bottom: 6px;
}

.co-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--muted);
}

.co-value {
  font-family: var(--display);
  font-weight: 800;
  font-size: 22px;
  color: var(--gold-text);
  text-align: right;
}

.active-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--muted);
}

.active-meta strong {
  color: var(--text);
}

.recent {
  margin-left: auto;
  display: flex;
  gap: 8px;
  font-family: var(--display);
  font-size: 17px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.recent .first {
  color: var(--text);
}

/* ---------- queue / standing */
.queue {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.q-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  padding: 8px 12px;
  border-radius: 12px;
  background: var(--surface);
  box-shadow: inset 4px 0 0 var(--c);
}

.q-row.next {
  outline: 1px dashed var(--c);
  outline-offset: -1px;
}

.q-rank {
  width: 22px;
  font-family: var(--display);
  font-weight: 800;
  font-size: 15px;
  color: var(--muted);
}

.q-name {
  font-family: var(--display);
  font-weight: 700;
  font-size: 19px;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.q-next {
  font-family: var(--display);
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--c);
  border: 1px solid var(--c);
  border-radius: 999px;
  padding: 1px 6px;
}

.q-score {
  margin-left: auto;
  font-family: var(--display);
  font-weight: 800;
  font-size: 28px;
  font-variant-numeric: tabular-nums;
}

.q-legs {
  min-width: 28px;
  text-align: center;
  font-family: var(--display);
  font-weight: 700;
  font-size: 15px;
  background: var(--bg);
  border-radius: 8px;
  padding: 4px 6px;
}

/* ---------- input */
.input-row {
  display: flex;
  gap: 8px;
}

.score-field {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  border: 1px solid var(--c);
  border-radius: 12px;
  padding: 0 16px;
  height: 60px;
}

.score-field.off {
  opacity: 0.6;
}

.score-label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--muted);
}

.score-field input {
  background: transparent;
  border: 0;
  color: var(--text);
  font-family: var(--display);
  font-weight: 800;
  font-size: 40px;
  text-align: right;
  width: 120px;
  outline: none;
  -moz-appearance: textfield;
}

.score-field input::-webkit-outer-spin-button,
.score-field input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.score-field input::placeholder {
  color: var(--placeholder);
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.key {
  height: 60px;
  border: 0;
  border-radius: 12px;
  background: var(--key);
  color: var(--text);
  font-family: var(--display);
  font-size: 30px;
  font-weight: 600;
}

.key:disabled {
  opacity: 0.4;
}

.key.delete {
  width: 72px;
  background: var(--key2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.key.enter {
  grid-column: span 2;
  background: var(--c);
  color: var(--on-accent);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
  grid-template-columns: minmax(70px, 1fr) repeat(var(--cols), minmax(0, 1fr));
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
  font-size: clamp(56px, 20vw, 110px);
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

/* ---------- double sheet */
.sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9;
  background: var(--backdrop);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.sheet {
  width: 100%;
  max-width: 460px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-bottom: 0;
  border-radius: 20px 20px 0 0;
  padding: 22px 16px calc(20px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
}

.sheet-title {
  margin: 0;
  font-family: var(--display);
  font-weight: 800;
  font-size: 28px;
  text-transform: uppercase;
}

.sheet-sub {
  margin: 0 0 12px;
  color: var(--muted);
  font-size: 15px;
}

.sheet-options {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 8px;
}

.sheet-options button {
  height: 64px;
  border: 0;
  border-radius: 12px;
  background: var(--key);
  color: var(--text);
  font-family: var(--display);
  font-size: 30px;
  font-weight: 700;
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

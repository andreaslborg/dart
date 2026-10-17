<template>
  <div class="ai">
    <div class="wrap">
      <header class="topbar">
        <router-link :to="backLink" class="icon-link" aria-label="Tilbage til scoreboard" title="Tilbage">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        </router-link>
        <h1 class="page-title">SPIL MOD AI</h1>
        <div class="pill" v-if="g.phase === 'play'">{{ g.startScore }} · LEG {{ g.legNo }}</div>
      </header>

      <!-- ============ SETUP ============ -->
      <section v-if="g.phase === 'setup'" class="setup">
        <label class="field">
          <span class="field-label">Dit navn</span>
          <input v-model="setup.name" type="text" maxlength="20" placeholder="Dit navn" autocomplete="off">
        </label>

        <div class="field">
          <span class="field-label">Niveau</span>
          <div class="levels">
            <button v-for="lv in levelList" :key="lv.key" type="button" class="level" :class="{ selected: setup.level === lv.key }" @click="setup.level = lv.key">
              <span class="level-name">{{ lv.name }}</span>
              <span class="level-avg">Gns. ca. {{ lv.target }}</span>
            </button>
          </div>
        </div>

        <div class="field">
          <span class="field-label">Spil</span>
          <div class="segmented">
            <button v-for="s in [301, 501]" :key="s" type="button" :class="{ selected: setup.startScore === s }" @click="setup.startScore = s">{{ s }}</button>
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
          <div class="segmented two">
            <button type="button" :class="{ selected: setup.starter === 'me' }" @click="setup.starter = 'me'">{{ setup.name || 'Mig' }}</button>
            <button type="button" :class="{ selected: setup.starter === 'bot' }" @click="setup.starter = 'bot'">{{ botNameFor(setup.level) }}</button>
          </div>
        </div>

        <button type="button" class="primary-btn" @click="startMatch">Start kamp</button>
        <p class="note">Double-out: du skal slutte på en double. Går du under 0 eller står på 1, er det bust.</p>
      </section>

      <!-- ============ PLAY / DONE ============ -->
      <template v-else>
        <div v-if="g.phase === 'done'" class="result-banner">
          <span>{{ g.legs.me > g.legs.bot ? 'Du vandt kampen!' : g.botName + ' vandt kampen' }}</span>
        </div>
        <div v-else-if="legOver" class="leg-banner">
          <span>{{ g.lastLegWinner === 'me' ? 'Du vandt leg ' + g.legNo + '!' : g.botName + ' vandt leg ' + g.legNo }}</span>
          <button type="button" class="next-leg" @click="nextLeg">
            Næste leg
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>

        <section class="score-display">
          <div v-for="side in ['me', 'bot']" :key="side" class="player-card" :class="{ active: g.turn === side && !legOver && g.phase === 'play' }">
            <div v-if="g.turn === side && !legOver && g.phase === 'play'" class="turn-tag">{{ side === 'me' ? 'DIN TUR' : 'KASTER' }}</div>
            <div class="name">{{ side === 'me' ? g.myName : g.botName }}</div>
            <div class="score" :class="{ long: String(g.remaining[side]).length > 3 }">{{ g.remaining[side] }}</div>
            <div class="checkout-row">
              <span v-if="hint(side)" class="checkout">{{ hint(side) }}</span>
            </div>
            <div class="recent">
              <span v-for="(v, i) in recent(side)" :key="i" :class="'recent-' + i">{{ v }}</span>
            </div>
            <div class="avg">AVG {{ fmtAvg(side) }}</div>
          </div>
          <div class="legs">
            <div class="legs-label">LEGS</div>
            <div class="legs-num" :class="{ lead: g.legs.me > g.legs.bot }">{{ g.legs.me }}</div>
            <div class="legs-sep"></div>
            <div class="legs-num" :class="{ lead: g.legs.bot > g.legs.me }">{{ g.legs.bot }}</div>
            <div class="legs-label">TIL {{ g.legsToWin }}</div>
          </div>
        </section>

        <!-- Bot's darts -->
        <div class="bot-darts" :class="{ dim: !botVisit.darts.length }" aria-live="polite">
          <span class="bot-label">{{ g.botName }}</span>
          <span v-for="i in 3" :key="i" class="dart-chip" :class="chipClass(i - 1)">{{ chipText(i - 1) }}</span>
          <span class="bot-total">{{ botVisitTotal }}</span>
        </div>

        <template v-if="g.phase === 'play'">
          <div class="input-row">
            <label class="score-field" :class="{ off: !myTurn }">
              <span class="score-label">SCORE</span>
              <input v-model="currentScore" type="number" inputmode="none" placeholder="0" aria-label="Score" :disabled="!myTurn" @keyup.enter="submitMine">
            </label>
            <button class="key delete" type="button" aria-label="Slet sidste tal" :disabled="!myTurn" @click="currentScore = String(currentScore).slice(0, -1)">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z" /><path d="M17 9l-5 6M12 9l5 6" /></svg>
            </button>
          </div>
          <div class="keypad">
            <button v-for="n in [7, 8, 9, 4, 5, 6, 1, 2, 3]" :key="n" class="key" type="button" :disabled="!myTurn" @click="press(n)">{{ n }}</button>
            <button class="key" type="button" :disabled="!myTurn" @click="press(0)">0</button>
            <button class="key enter" type="button" :disabled="!myTurn" @click="submitMine">ENTER</button>
          </div>
        </template>

        <section class="stats-block">
          <h2 class="section-title">STATS</h2>
          <div class="stats">
            <div class="stats-row head"><span></span><span>{{ g.myName }}</span><span>{{ g.botName }}</span></div>
            <div v-for="row in statRows" :key="row.label" class="stats-row"><span>{{ row.label }}</span><span>{{ row.me }}</span><span>{{ row.bot }}</span></div>
          </div>
        </section>

        <div class="end-actions">
          <template v-if="g.phase === 'done'">
            <button type="button" class="primary-btn" @click="rematch">Omkamp</button>
            <button type="button" class="ghost-btn" @click="toSetup">Ny opsætning</button>
          </template>
          <button v-else type="button" class="ghost-btn danger" @click="quitMatch">Afslut kamp</button>
        </div>
      </template>
    </div>

    <!-- Darts at double -->
    <div v-if="pendingDouble" class="sheet-backdrop">
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="ai-sheet-title">
        <h2 id="ai-sheet-title" class="sheet-title">{{ pendingDouble.checkout ? 'Checkout!' : 'Darts på double?' }}</h2>
        <p class="sheet-sub">{{ pendingDouble.checkout ? 'Hvor mange darts kastede du på double?' : 'Du stod på ' + pendingDouble.before + '. Hvor mange darts kastede du på double?' }}</p>
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
import { getDatabase, ref as firebaseRef, set, push } from 'firebase/database';
import confetti from 'canvas-confetti';
import getDartsCheckout from '@/getDartsCheckout';
import { LEVELS, playVisit, humanVisitResult } from '@/ai/dartBot';
import { buildPlayerSnapshot } from '@/matchHistory';
import { showAlert, showConfirm } from '@/dialog';
import { local, shared, buzz } from '@/settings';

const STORE_KEY = 'borgdart_ai_v1';
const DART_DELAY = 750;

const freshSide = () => ({ visits: [], legScores: [], doubleDarts: [], legDarts: [], checkouts: [], highestCheckout: 0 });

const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
};
const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
};

export default {
  setup() {
    const route = useRoute();
    const database = getDatabase();
    const backLink = computed(() => ({ path: '/', query: route.query }));
    const levelList = Object.values(LEVELS);
    const botNameFor = (key) => `Bot (${LEVELS[key].name})`;

    const saved = load(STORE_KEY, null);
    const setup = reactive({
      name: local.name || (saved && saved.setup && saved.setup.name) || 'Mig',
      level: (saved && saved.setup && saved.setup.level) || 'pub',
      startScore: (saved && saved.setup && saved.setup.startScore) || 501,
      legsToWin: (saved && saved.setup && saved.setup.legsToWin) || 2,
      starter: (saved && saved.setup && saved.setup.starter) || 'me',
    });

    const blankGame = () => ({
      phase: 'setup', level: 'pub', botName: '', myName: '', startScore: 501, legsToWin: 2, starter: 'me',
      legNo: 1, turn: 'me', remaining: { me: 501, bot: 501 }, legs: { me: 0, bot: 0 },
      me: freshSide(), bot: freshSide(), lastLegWinner: null, legOver: false, matchId: null, startedAt: null,
    });
    const g = reactive(saved && saved.game ? { ...blankGame(), ...saved.game } : blankGame());

    const currentScore = ref('');
    const pendingDouble = ref(null);
    const botVisit = reactive({ darts: [], shown: 0, total: null });
    let timers = [];
    const botRunning = ref(false);

    const legOver = computed(() => g.legOver);
    const myTurn = computed(() => g.phase === 'play' && g.turn === 'me' && !g.legOver && !pendingDouble.value && !botRunning.value);

    watch([g, setup], () => save(STORE_KEY, { game: g, setup }), { deep: true });

    // ---------- display helpers
    const sum = (a) => a.reduce((x, y) => x + y, 0);
    const dartsThrown = (side) => {
      // Visits count as 3 darts; for the bot we know the exact number on checkouts.
      return g[side].visits.length * 3;
    };
    const fmtAvg = (side) => {
      const d = dartsThrown(side);
      if (!d) return '–';
      const a = (sum(g[side].visits) / d) * 3;
      return a % 1 === 0 ? String(a) : a.toFixed(1);
    };
    const recent = (side) => g[side].legScores.slice(-3).reverse();
    const hint = (side) => {
      if (!shared.checkoutHints) return '';
      const r = g.remaining[side];
      if (r > 170 || r < 2) return '';
      const c = getDartsCheckout(r);
      if (!c || c === 'No checkout') return '';
      return c.split(',').map(s => s.trim()).join(' · ');
    };

    const chipText = (i) => (i < botVisit.shown ? botVisit.darts[i].label : '');
    const chipClass = (i) => {
      if (i >= botVisit.shown) return 'empty';
      const d = botVisit.darts[i];
      // Red = a genuinely poor result: a miss, or a different number than the one aimed at.
      const offTarget = d.aimed && d.ring !== 'SB' && d.ring !== 'DB' && d.n !== d.aimed.n;
      const poor = d.value === 0 || offTarget;
      return { bad: poor, big: !poor && (d.ring === 'T' || d.ring === 'DB'), dbl: !poor && d.double };
    };
    const botVisitTotal = computed(() => {
      if (botVisit.total === null) {
        if (!botVisit.darts.length) return '';
        return sum(botVisit.darts.slice(0, botVisit.shown).map(d => d.value));
      }
      return botVisit.total === 'BUST' ? 'BUST' : `= ${botVisit.total}`;
    });

    const statRows = computed(() => {
      const row = (side) => {
        const s = g[side];
        const v = s.visits;
        const dd = sum(s.doubleDarts);
        return {
          n180: v.filter(x => x === 180).length,
          t100: v.filter(x => x >= 100).length,
          high: v.length ? Math.max(...v) : '–',
          pct: dd ? `${Math.round((s.checkouts.length / dd) * 100)}%` : '–',
          best: s.legDarts.length ? Math.min(...s.legDarts) : '–',
          hc: s.highestCheckout || '–',
        };
      };
      const a = row('me');
      const b = row('bot');
      return [
        { label: 'Gennemsnit', me: fmtAvg('me'), bot: fmtAvg('bot') },
        { label: '180', me: a.n180, bot: b.n180 },
        { label: '100+', me: a.t100, bot: b.t100 },
        { label: 'Højeste score', me: a.high, bot: b.high },
        { label: 'Checkout %', me: a.pct, bot: b.pct },
        { label: 'Højeste checkout', me: a.hc, bot: b.hc },
        { label: 'Bedste leg (darts)', me: a.best, bot: b.best },
      ];
    });

    // ---------- history
    const saveHistory = () => {
      if (!g.matchId) return;
      const snap = (side, name) => buildPlayerSnapshot({
        name,
        legs: g.legs[side],
        setScores: g[side].visits,
        highestCheckout: g[side].highestCheckout,
        checkouts: g[side].checkouts,
        doubleDarts: g[side].doubleDarts,
        legDarts: g[side].legDarts,
      });
      set(firebaseRef(database, `history/matches/${g.matchId}`), {
        startedAt: g.startedAt,
        updatedAt: Date.now(),
        startScore: g.startScore,
        mode: 'ai',
        level: g.level,
        players: { p1: snap('me', g.myName), p2: snap('bot', g.botName) },
      }).catch(err => console.error('Kunne ikke gemme kamp:', err));
    };

    // ---------- flow
    const starterOfLeg = (legNo) => {
      if (legNo % 2 === 1) return g.starter;
      return g.starter === 'me' ? 'bot' : 'me';
    };

    const clearTimers = () => {
      timers.forEach(clearTimeout);
      timers = [];
      botRunning.value = false;
    };

    const startMatch = () => {
      clearTimers();
      const name = (setup.name || '').trim() || 'Mig';
      setup.name = name;
      if (!local.name) local.name = name;
      Object.assign(g, blankGame(), {
        phase: 'play', level: setup.level, botName: botNameFor(setup.level), myName: name,
        startScore: setup.startScore, legsToWin: setup.legsToWin, starter: setup.starter,
        remaining: { me: setup.startScore, bot: setup.startScore },
        matchId: push(firebaseRef(database, 'history/matches')).key, startedAt: Date.now(),
      });
      g.turn = starterOfLeg(1);
      Object.assign(botVisit, { darts: [], shown: 0, total: null });
      currentScore.value = '';
      if (g.turn === 'bot') runBot();
    };

    const finishLeg = (winner) => {
      g.legs[winner] += 1;
      g.lastLegWinner = winner;
      g.legOver = true;
      saveHistory();
      if (g.legs[winner] >= g.legsToWin) {
        g.phase = 'done';
        if (winner === 'me') confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      } else if (winner === 'me') {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      }
    };

    const nextLeg = () => {
      clearTimers();
      g.legNo += 1;
      g.legOver = false;
      g.remaining.me = g.startScore;
      g.remaining.bot = g.startScore;
      g.me.legScores = [];
      g.bot.legScores = [];
      Object.assign(botVisit, { darts: [], shown: 0, total: null });
      g.turn = starterOfLeg(g.legNo);
      if (g.turn === 'bot') runBot();
    };

    // Hand the turn over. The bot waits while the darts-at-double sheet is open.
    const afterVisit = (side) => {
      if (g.legOver) return;
      g.turn = side === 'me' ? 'bot' : 'me';
      if (g.turn === 'bot' && !pendingDouble.value) runBot();
    };

    // The bot throws its darts one at a time.
    const runBot = () => {
      if (g.phase !== 'play' || g.legOver || botRunning.value) return;
      botRunning.value = true;
      const level = LEVELS[g.level];
      const before = g.remaining.bot;
      const visit = playVisit(before, level);
      Object.assign(botVisit, { darts: visit.darts, shown: 0, total: null });
      visit.darts.forEach((d, i) => {
        timers.push(setTimeout(() => { botVisit.shown = i + 1; }, DART_DELAY * (i + 1)));
      });
      timers.push(setTimeout(() => {
        const s = g.bot;
        s.visits.push(visit.scored);
        s.legScores.push(visit.bust ? 'B' : visit.scored);
        s.doubleDarts.push(visit.doubleDarts);
        botVisit.total = visit.bust ? 'BUST' : visit.scored;
        g.remaining.bot = visit.remaining;
        botRunning.value = false;
        if (visit.checkout) {
          s.legDarts.push((s.legScores.length - 1) * 3 + visit.darts.length);
          s.checkouts.push(before);
          s.highestCheckout = Math.max(s.highestCheckout, before);
          finishLeg('bot');
        } else {
          saveHistory();
          afterVisit('bot');
        }
      }, DART_DELAY * visit.darts.length + 500));
    };

    const press = (n) => {
      buzz();
      if (String(currentScore.value).length >= 3) return;
      currentScore.value = `${currentScore.value}${n}`;
    };

    const submitMine = async () => {
      if (!myTurn.value) return;
      buzz();
      const raw = String(currentScore.value).trim();
      const scored = raw === '' ? 0 : parseInt(raw, 10);
      if (Number.isNaN(scored) || scored < 0) return;
      if (scored > 180) {
        currentScore.value = '';
        await showAlert('En runde kan højst give 180 point.', { title: 'Duuude' });
        return;
      }
      const before = g.remaining.me;
      const result = humanVisitResult(before, scored);
      currentScore.value = '';
      Object.assign(botVisit, { darts: [], shown: 0, total: null });
      const s = g.me;
      const onFinish = shared.askDoubles && before <= 50 && before > 1;
      if (result === 'bust') {
        s.visits.push(0);
        s.legScores.push('B');
        s.doubleDarts.push(0);
        await showAlert(`Du havde ${before} tilbage. ${scored} giver bust, så runden tæller 0.`, { title: 'Bust!' });
        if (onFinish) pendingDouble.value = { before, checkout: false };
        saveHistory();
        afterVisit('me');
        return;
      }
      s.visits.push(scored);
      s.legScores.push(scored);
      s.doubleDarts.push(0);
      g.remaining.me = before - scored;
      if (result === 'checkout') {
        s.legDarts.push(s.legScores.length * 3);
        s.checkouts.push(before);
        s.highestCheckout = Math.max(s.highestCheckout, before);
        if (shared.askDoubles) pendingDouble.value = { before, checkout: true };
        finishLeg('me');
        return;
      }
      if (onFinish) pendingDouble.value = { before, checkout: false };
      saveHistory();
      afterVisit('me');
    };

    const answerDouble = (n) => {
      if (!pendingDouble.value) return;
      pendingDouble.value = null;
      const dd = g.me.doubleDarts;
      if (dd.length) dd[dd.length - 1] = n;
      saveHistory();
      if (g.phase === 'play' && g.turn === 'bot' && !g.legOver) runBot();
    };

    const rematch = () => {
      Object.assign(setup, { level: g.level, startScore: g.startScore, legsToWin: g.legsToWin, starter: g.starter === 'me' ? 'bot' : 'me', name: g.myName });
      startMatch();
    };

    const toSetup = () => {
      clearTimers();
      Object.assign(g, blankGame());
    };

    const quitMatch = async () => {
      if (await showConfirm('Kampen er gemt i historikken, som den står nu.', { title: 'Afslut kamp?', confirmText: 'Afslut' })) {
        toSetup();
      }
    };

    onMounted(() => {
      // Resume a bot turn that was interrupted by a reload.
      if (g.phase === 'play' && g.turn === 'bot' && !g.legOver) runBot();
    });
    onUnmounted(clearTimers);

    return {
      g, setup, levelList, botNameFor, backLink, currentScore, pendingDouble, botVisit, legOver, myTurn,
      fmtAvg, recent, hint, chipText, chipClass, botVisitTotal, statRows,
      startMatch, nextLeg, press, submitMine, answerDouble, rematch, toSetup, quitMatch,
    };
  },
};
</script>

<style scoped>
.ai {

  color: var(--text);
  font-family: 'Barlow', system-ui, sans-serif;
  padding: 16px 16px 40px;
  box-sizing: border-box;
}

.ai *,
.ai *::before,
.ai *::after {
  box-sizing: border-box;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

button:disabled {
  cursor: default;
}

.wrap {
  max-width: 440px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.icon-link:hover {
  color: var(--text);
  border-color: var(--accent);
}

.pill {
  font-family: var(--display);
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.08em;
  color: var(--muted);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 6px 12px;
}

/* Setup */
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

.field-label {
  font-family: var(--display);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}

.field input {
  height: 52px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--text);
  font-family: var(--display);
  font-weight: 700;
  font-size: 22px;
  outline: none;
}

.field input:focus {
  border-color: var(--accent);
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
  padding: 14px;
  border-radius: 14px;
  border: 2px solid var(--surface);
  background: var(--surface);
  color: var(--text);
  text-align: left;
}

.level.selected {
  border-color: var(--accent);
}

.level-name {
  font-family: var(--display);
  font-weight: 800;
  font-size: 24px;
  text-transform: uppercase;
}

.level-avg {
  font-size: 13px;
  color: var(--muted);
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
  font-size: 24px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.primary-btn:hover {
  background: var(--accent-hover);
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

.ghost-btn.danger {
  color: var(--danger);
}

.ghost-btn:hover {
  background: var(--surface);
}

.note {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
  text-align: center;
}

/* Banners */
.result-banner,
.leg-banner {
  background: var(--accent);
  color: var(--on-accent);
  font-family: var(--display);
  font-weight: 800;
  font-size: 24px;
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

.result-banner {
  justify-content: center;
  padding: 12px 16px;
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

/* Scoreboard */
.score-display {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 52px minmax(0, 1fr);
  gap: 8px;
  margin-top: 6px;
}

.score-display .player-card:first-child {
  grid-column: 1;
  grid-row: 1;
}

.score-display .player-card:nth-child(2) {
  grid-column: 3;
  grid-row: 1;
}

.score-display .legs {
  grid-column: 2;
  grid-row: 1;
}

.player-card {
  position: relative;
  background: var(--surface);
  border: 2px solid var(--surface);
  border-radius: 16px;
  padding: 14px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  transition: border-color 0.2s;
}

.player-card.active {
  border-color: var(--accent);
}

.turn-tag {
  position: absolute;
  top: -11px;
  right: 12px;
  background: var(--accent);
  color: var(--on-accent);
  font-family: var(--display);
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.1em;
  padding: 3px 8px;
  border-radius: 999px;
}

.name {
  font-family: var(--display);
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.score {
  font-family: var(--display);
  font-weight: 800;
  font-size: clamp(52px, 18vw, 76px);
  line-height: 0.9;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.score.long {
  font-size: clamp(40px, 13vw, 60px);
}

.checkout-row {
  min-height: 22px;
  display: flex;
}

.checkout {
  font-family: var(--display);
  font-weight: 700;
  font-size: 15px;
  color: var(--on-accent);
  background: var(--soft);
  border-radius: 6px;
  padding: 2px 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.player-card.active .checkout {
  background: var(--gold);
  color: var(--on-gold);
}

.recent {
  display: flex;
  gap: 10px;
  min-height: 21px;
  font-family: var(--display);
  font-size: 17px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  margin-top: 4px;
}

.recent .recent-0 {
  color: var(--text);
}

.recent .recent-2 {
  opacity: 0.6;
}

.avg {
  font-size: 13px;
  color: var(--muted);
  font-weight: 600;
  letter-spacing: 0.06em;
}

.legs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.legs-label {
  font-size: 11px;
  color: var(--muted);
  font-weight: 600;
  letter-spacing: 0.1em;
}

.legs-num {
  font-family: var(--display);
  font-weight: 800;
  font-size: 30px;
  line-height: 1;
}

.legs-num.lead {
  color: var(--accent);
}

.legs-sep {
  width: 16px;
  height: 2px;
  background: var(--line);
}

/* Bot darts */
.bot-darts {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border-radius: 12px;
  padding: 10px 12px;
  min-height: 56px;
}

.bot-darts.dim {
  opacity: 0.6;
}

.bot-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--muted);
  text-transform: uppercase;
  flex: 0 1 auto;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dart-chip {
  flex: 0 0 auto;
  min-width: 52px;
  height: 36px;
  padding: 0 8px;
  border-radius: 8px;
  background: var(--key);
  color: var(--text);
  font-family: var(--display);
  font-weight: 800;
  font-size: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pop 0.2s ease;
}

.dart-chip.empty {
  background: transparent;
  border: 1px dashed var(--line);
  animation: none;
}

.dart-chip.big {
  background: var(--accent);
  color: var(--on-accent);
}

.dart-chip.dbl {
  background: var(--gold);
  color: var(--on-gold);
}

.dart-chip.bad {
  background: var(--bad-bg);
  color: var(--danger);
}

.bot-total {
  margin-left: auto;
  font-family: var(--display);
  font-weight: 800;
  font-size: 22px;
  white-space: nowrap;
}

@keyframes pop {
  from { transform: scale(0.7); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Input */
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
  border: 1px solid var(--accent);
  border-radius: 12px;
  padding: 0 16px;
  height: 60px;
}

.score-field.off {
  border-color: var(--line);
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
  width: 140px;
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
  height: 62px;
  border: 0;
  border-radius: 12px;
  background: var(--key);
  color: var(--text);
  font-family: var(--display);
  font-size: 30px;
  font-weight: 600;
}

.key:not(:disabled):hover {
  background: var(--key-hover);
}

.key:disabled {
  opacity: 0.4;
}

.key.delete {
  width: 72px;
  height: 60px;
  background: var(--key2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.key.enter {
  grid-column: span 2;
  background: var(--accent);
  color: var(--on-accent);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

/* Stats */
.stats-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  padding: 4px 14px;
  font-variant-numeric: tabular-nums;
}

.stats-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 84px 96px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line2);
  font-size: 15px;
}

.stats-row:last-child {
  border-bottom: 0;
}

.stats-row span:first-child {
  color: var(--soft);
}

.stats-row span:not(:first-child) {
  text-align: right;
}

.stats-row.head span {
  font-family: var(--display);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.end-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Sheet */
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
  max-width: 440px;
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

.sheet-options button:hover {
  background: var(--accent);
  color: var(--on-accent);
}
</style>

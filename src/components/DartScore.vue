<template>
  <div class="dart-score game-screen">
    <div v-if="needsPlayer" class="picker-backdrop">
      <div class="picker" role="dialog" aria-modal="true" aria-labelledby="picker-title">
        <svg width="44" height="44" viewBox="0 0 48 48" aria-hidden="true">
          <rect x="0" y="0" width="48" height="48" rx="12" fill="#5B95FF" />
          <path d="M15 10v28M15 10h10a7 7 0 0 1 0 14H15M15 24h12a7 7 0 0 1 0 14H15" fill="none" stroke="#0E0F12" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="25" cy="17" r="2.6" fill="#0E0F12" />
        </svg>
        <h2 id="picker-title" class="picker-title">Hvem er du?</h2>
        <p class="picker-sub">Vælg din spiller for at taste scores.</p>
        <div class="picker-options">
          <button type="button" class="picker-option" @click="choosePlayer(1)">
            <span class="picker-num">SPILLER 1</span>
            <span class="picker-name">{{ player1Name }}</span>
          </button>
          <button type="button" class="picker-option" @click="choosePlayer(2)">
            <span class="picker-num">SPILLER 2</span>
            <span class="picker-name">{{ player2Name }}</span>
          </button>
        </div>
      </div>
    </div>
    <BullsUpPanel
      v-if="bullsUp && !needsPlayer"
      :names="[player1Name, player2Name]"
      :results="[bullsUp.p1 || null, bullsUp.p2 || null]"
      :own-index="bullOwnIndex"
      :round="bullsUp.round || 1"
      :start-text="bullsUp.purpose === 'match' ? 'Start kamp' : 'Start leg'"
      @set="setBull"
      @rethrow="bullRethrow"
      @start="bullStart"
      @cancel="bullCancel"
    />
    <div v-if="starterPrompt && !needsPlayer" class="picker-backdrop">
      <div class="picker" role="dialog" aria-modal="true" aria-labelledby="starter-title">
        <template v-if="starterPrompt.type === 'match'">
          <h2 id="starter-title" class="picker-title">Ny kamp</h2>
          <span class="picker-label">SPIL</span>
          <div class="game-pick" role="group" aria-label="Vælg spil">
            <button v-for="p in presetScores" :key="'g' + p" type="button" :class="{ selected: starterPrompt.score === p }" :aria-pressed="starterPrompt.score === p ? 'true' : 'false'" @click="starterPrompt.score = p">{{ p }}</button>
          </div>
          <span class="picker-label">HVEM STARTER?</span>
        </template>
        <h2 v-else id="starter-title" class="picker-title">Hvem starter?</h2>
        <p class="picker-sub">Starter leg 1, 3, 5 … Den anden starter leg 2, 4, 6 …</p>
        <div class="picker-options">
          <button type="button" class="picker-option" @click="chooseStarter(1)">
            <span class="picker-num">SPILLER 1</span>
            <span class="picker-name">{{ player1Name }}</span>
          </button>
          <button type="button" class="picker-option" @click="chooseStarter(2)">
            <span class="picker-num">SPILLER 2</span>
            <span class="picker-name">{{ player2Name }}</span>
          </button>
        </div>
        <button type="button" class="bull-choice" @click="chooseBull">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg>
          Bull om det
        </button>
        <button type="button" class="picker-cancel" @click="starterPrompt = null">Annuller</button>
      </div>
    </div>
    <div v-if="pendingDouble" class="sheet-backdrop">
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <h2 id="sheet-title" class="sheet-title">{{ pendingDouble.checkout ? 'Checkout!' : 'Darts på double?' }}</h2>
        <p class="sheet-sub">{{ pendingDouble.checkout ? 'Hvor mange darts kastede du på double?' : 'Du stod på ' + pendingDouble.before + '. Hvor mange darts kastede du på double?' }}</p>
        <div class="sheet-options">
          <button v-for="n in (pendingDouble.checkout ? [1, 2, 3] : [0, 1, 2, 3])" :key="n" type="button" @click="answerDouble(n)">{{ n }}</button>
        </div>
      </div>
    </div>
    <div class="layout lock-col">
      <div class="col-main lock-col">
        <header class="topbar">
          <div class="brand">
            <svg class="brand-mark" width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">
              <rect x="0" y="0" width="48" height="48" rx="12" fill="#5B95FF" />
              <path d="M15 10v28M15 10h10a7 7 0 0 1 0 14H15M15 24h12a7 7 0 0 1 0 14H15" fill="none" stroke="#0E0F12" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="25" cy="17" r="2.6" fill="#0E0F12" />
            </svg>
            <span class="brand-word">BORG<span class="accent">DART</span></span>
          </div>
          <div class="top-right">
            <div v-if="!matchEnded" class="pill">{{ startScore }} · LEG {{ legNumber }}</div>
            <LockButton :available="!matchEnded" />
            <AppMenu />
          </div>
        </header>

        <!-- No match running (ended with "Afslut kamp") -->
        <section v-if="matchEnded" class="idle">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></svg>
          <h2 class="idle-title">Ingen kamp i gang</h2>
          <div v-if="lastMatch" class="idle-last">
            <span class="idle-label">SENESTE KAMP</span>
            <div class="idle-result">
              <span :class="{ won: lastMatch.p1Legs > lastMatch.p2Legs }">{{ lastMatch.p1Name }}</span>
              <span class="idle-legs">{{ lastMatch.p1Legs }}<span class="sep">–</span>{{ lastMatch.p2Legs }}</span>
              <span :class="{ won: lastMatch.p2Legs > lastMatch.p1Legs }">{{ lastMatch.p2Name }}</span>
            </div>
            <span class="idle-note">{{ lastMatch.saved ? 'Gemt i historikken' : 'Ingen vundne legs, så den blev ikke gemt' }}</span>
          </div>
          <button type="button" class="idle-start" @click="openNewMatch">Start ny kamp</button>
          <router-link :to="historyLink" class="idle-link">Se historik</router-link>
        </section>

        <template v-else>
        <div v-if="hasWinner" class="winner-banner">
          <span>{{ scoreboardTitle }}</span>
          <button v-if="matchOver" type="button" class="next-leg" @click="resetWins">
            Ny kamp
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
          <button v-else type="button" class="next-leg" @click="startLeg(startScore)">
            Start leg {{ legNumber + 1 }}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>

        <!-- Focus view: your own score big, the opponent small underneath -->
        <section v-if="focusView" class="focus">
          <div class="focus-card" :class="{ active: focusView.me.isTurn }">
            <div v-if="focusView.me.isTurn" class="turn-tag">DIN TUR</div>
            <div class="focus-top">
              <button class="name" type="button" title="Skift navn" @click="changePlayerName(focusView.me.n)">{{ focusView.me.name }}</button>
              <span class="focus-avg">AVG <strong>{{ fmt(focusView.me.avg) }}</strong></span>
            </div>
            <span v-if="legStarter === focusView.me.n" class="starter-tag">STARTER LEG {{ legNumber }}</span>
            <div class="focus-main">
              <div class="focus-score">{{ focusView.me.score }}</div>
              <div v-if="focusView.me.checkout && shared.checkoutHints" class="focus-co">
                <span class="focus-co-label">CHECKOUT</span>
                <span class="focus-co-value" :class="{ none: focusView.me.checkout === 'No checkout' }">{{ formatCheckout(focusView.me.checkout) }}</span>
              </div>
            </div>
            <div class="focus-recent">
              <span v-for="i in 3" :key="i" :class="{ first: i === 1 }">{{ focusView.me.recent[i - 1] !== undefined ? focusView.me.recent[i - 1] : '–' }}</span>
            </div>
          </div>

          <div class="focus-opp" :class="{ active: focusView.opp.isTurn }">
            <span class="focus-dot" aria-hidden="true"></span>
            <button class="opp-name" type="button" title="Skift navn" @click="changePlayerName(focusView.opp.n)">{{ focusView.opp.name }}</button>
            <span v-if="focusView.opp.isTurn" class="opp-turn">KASTER</span>
            <span v-else-if="focusView.opp.checkout && shared.checkoutHints && focusView.opp.checkout !== 'No checkout'" class="opp-co">{{ formatCheckout(focusView.opp.checkout) }}</span>
            <span class="opp-score">{{ focusView.opp.score }}</span>
            <span class="opp-legs" :title="`Legs: ${focusView.me.legs}–${focusView.opp.legs}`">{{ focusView.me.legs }}<span class="sep">–</span>{{ focusView.opp.legs }}<template v-if="shared.legsToWin"><span class="sep"> / </span>{{ shared.legsToWin }}</template></span>
          </div>
        </section>

        <section v-else class="score-display">
          <div class="player-card" :class="{ active: isPlayer1Turn }">
            <div v-if="isPlayer1Turn" class="turn-tag">DIN TUR</div>
            <button class="name" type="button" title="Skift navn" @click="changePlayerName(1)">{{ player1Name }}</button>
            <span v-if="legStarter === 1" class="starter-tag">STARTER LEG {{ legNumber }}</span>
            <div class="score" :class="{ long: String(totalScores.player1).length > 3 }">{{ totalScores.player1 }}</div>
            <div class="checkout-row">
              <span v-if="player1Checkout && shared.checkoutHints" class="checkout" :class="{ none: player1Checkout === 'No checkout' }">{{ formatCheckout(player1Checkout) }}</span>
            </div>
            <div class="recent">
              <span v-for="(s, i) in recentScores(player1Scores)" :key="i" :class="'recent-' + i">{{ s }}</span>
            </div>
            <div class="avg">AVG {{ fmt(averageScore.player1) }}</div>
          </div>

          <div class="legs">
            <div class="legs-label">LEGS</div>
            <div class="legs-num" :class="{ lead: player1Wins > player2Wins }">{{ player1Wins }}</div>
            <div class="legs-sep"></div>
            <div class="legs-num" :class="{ lead: player2Wins > player1Wins }">{{ player2Wins }}</div>
            <div v-if="shared.legsToWin" class="legs-label">TIL {{ shared.legsToWin }}</div>
          </div>

          <div class="player-card" :class="{ active: !isPlayer1Turn }">
            <div v-if="!isPlayer1Turn" class="turn-tag">DIN TUR</div>
            <button class="name" type="button" title="Skift navn" @click="changePlayerName(2)">{{ player2Name }}</button>
            <span v-if="legStarter === 2" class="starter-tag">STARTER LEG {{ legNumber }}</span>
            <div class="score" :class="{ long: String(totalScores.player2).length > 3 }">{{ totalScores.player2 }}</div>
            <div class="checkout-row">
              <span v-if="player2Checkout && shared.checkoutHints" class="checkout" :class="{ none: player2Checkout === 'No checkout' }">{{ formatCheckout(player2Checkout) }}</span>
            </div>
            <div class="recent">
              <span v-for="(s, i) in recentScores(player2Scores)" :key="i" :class="'recent-' + i">{{ s }}</span>
            </div>
            <div class="avg">AVG {{ fmt(averageScore.player2) }}</div>
          </div>
        </section>

        <div class="input-row">
          <label class="score-field">
            <span class="score-label">SCORE</span>
            <input type="number"
                   v-model="currentScore"
                   id="scoreInput"
                   inputmode="none"
                   placeholder="0"
                   autofocus
                   @keyup.enter="submitScore">
          </label>
          <VoiceInput v-if="voice.enabled.value" :voice="voice" />
          <button class="key delete" type="button" aria-label="Slet sidste tal" @click="deleteLastNum">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z" /><path d="M17 9l-5 6M12 9l5 6" /></svg>
          </button>
        </div>

        <div class="keypad">
          <button class="key" type="button" v-for="num in [7,8,9,4,5,6,1,2,3]" :key="num" @click="updateCurrentScore(num)">{{ num }}</button>
          <button class="key" type="button" @click="updateCurrentScore(0)">0</button>
          <button class="key enter" type="button" @click="submitScore">ENTER</button>
        </div>

        <section class="settings">
          <h2 class="section-title lock-hide">SPIL</h2>
          <div class="segmented lock-hide">
            <button v-for="p in presetScores" :key="p" type="button" :class="{ selected: p === startScore }" @click="setPredefinedScore(p)">{{ p }}</button>
          </div>
          <div class="actions">
            <button type="button" @click="switchTurns">Skift tur</button>
            <button type="button" @click="undoLastTurn">Fortryd tur</button>
            <button type="button" class="lock-hide" @click="endMatch">Afslut kamp</button>
            <button type="button" class="danger lock-hide" @click="resetWins">Ny kamp</button>
          </div>
        </section>
        </template>
      </div>

      <section v-if="!matchEnded" class="col-stats lock-hide">
        <h2 class="section-title">STATS</h2>
        <div class="stats">
          <div class="stats-row head">
            <span></span>
            <span :class="{ accent: isPlayer1Turn }">{{ player1Name }}</span>
            <span :class="{ accent: !isPlayer1Turn }">{{ player2Name }}</span>
          </div>
          <div class="stats-group">Scoring</div>
          <div class="stats-row"><span>Gns. leg</span><span>{{ fmt(averageScore.player1) }}</span><span>{{ fmt(averageScore.player2) }}</span></div>
          <div class="stats-row"><span>Gns. kamp</span><span>{{ fmt(averageSetScore.player1) }}</span><span>{{ fmt(averageSetScore.player2) }}</span></div>
          <div class="stats-row"><span>Første 9 dart</span><span>{{ fmt(firstNineDartSetScore.player1) }}</span><span>{{ fmt(firstNineDartSetScore.player2) }}</span></div>
          <div class="stats-row"><span>180</span><span>{{ tonStats.player1.max }}</span><span>{{ tonStats.player2.max }}</span></div>
          <div class="stats-row"><span>140+</span><span>{{ tonStats.player1.t140 }}</span><span>{{ tonStats.player2.t140 }}</span></div>
          <div class="stats-row"><span>100+</span><span>{{ tonStats.player1.t100 }}</span><span>{{ tonStats.player2.t100 }}</span></div>
          <div class="stats-row"><span>Højeste score</span><span>{{ fmt(highestThreeDartScore.player1) }}</span><span>{{ fmt(highestThreeDartScore.player2) }}</span></div>
          <div class="stats-group">Finishing</div>
          <div class="stats-row"><span>Checkout %</span><span>{{ fmt(finishStats.player1.pct) }}</span><span>{{ fmt(finishStats.player2.pct) }}</span></div>
          <div class="stats-row"><span>Højeste checkout</span><span class="gold">{{ fmt(player1HighestCheckout) }}</span><span class="gold">{{ fmt(player2HighestCheckout) }}</span></div>
          <div class="stats-row"><span>Checkouts 100+</span><span>{{ finishStats.player1.big }}</span><span>{{ finishStats.player2.big }}</span></div>
          <div class="stats-row"><span>Bedste leg (darts)</span><span>{{ fmt(finishStats.player1.best) }}</span><span>{{ fmt(finishStats.player2.best) }}</span></div>
          <div class="stats-row"><span>Gns. darts pr. leg</span><span>{{ fmt(finishStats.player1.avgDarts) }}</span><span>{{ fmt(finishStats.player2.avgDarts) }}</span></div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import getDartsCheckout from '@/getDartsCheckout'
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDatabase, ref as firebaseRef, onValue, update, set, push } from 'firebase/database';
import { buildPlayerSnapshot } from '@/matchHistory';
import { showAlert, showConfirm, showPrompt } from '@/dialog';
import { local, shared, buzz } from '@/settings';
import AppMenu from '@/components/AppMenu.vue';
import LockButton from '@/components/LockButton.vue';
import BullsUpPanel from '@/components/BullsUpPanel.vue';
import VoiceInput from '@/components/VoiceInput.vue';
import { useVoiceInput } from '@/useVoiceInput';
import { dialogState } from '@/dialog';
import confetti from 'canvas-confetti';
export default {
  components: { AppMenu, BullsUpPanel, VoiceInput, LockButton },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const routerReady = ref(false);
    router.isReady().then(() => { routerReady.value = true; });
    const hasPlayerParam = computed(() => route.query.player === '1' || route.query.player === '2');
    // A device with a saved seat ("Hvem er jeg") never needs to ask.
    const needsPlayer = computed(() => routerReady.value && !hasPlayerParam.value && !local.seat);
    const choosePlayer = (n) => {
      local.seat = n;
      router.replace({ query: { ...route.query, player: String(n) } });
    };
    watch([routerReady, () => route.query.player], () => {
      if (routerReady.value && !hasPlayerParam.value && local.seat) {
        router.replace({ query: { ...route.query, player: String(local.seat) } });
      }
    }, { immediate: true });
    const database = getDatabase();
    const dbRef = firebaseRef(database, 'scores');
    const totalScores = ref({ player1: 501, player2: 501 });
    const currentScore = ref('');
    const isPlayer1Turn = ref(false); // Initialize isPlayer1Turn
    const scoreboardTitle = ref('Borg Dart'); // Initialize scoreboard title'
    const player1Name = ref('Player 1'); // Initialize player 1 name
    const player2Name = ref('Player 2'); // Initialize player 2 name
    const player1Wins = ref(0);
    const player2Wins = ref(0);
    const player1Checkout = ref("");
    const player2Checkout = ref(""); 
    const player1Scores = ref([]); 
    const player2Scores = ref([]); 
    const player1SetScores = ref([]); 
    const player2SetScores = ref([]); 
    const player1HighestCheckout = ref(null);
    const player2HighestCheckout = ref(null);
    const player1LowestCheckout = ref(NaN);
    const player2LowestCheckout = ref(NaN);
    const startScore = ref(501);
    // Finishing data: darts thrown at a double per visit (aligned with set scores),
    // darts used per won leg, and the value of every checkout.
    const player1DoubleDarts = ref([]);
    const player2DoubleDarts = ref([]);
    const player1LegDarts = ref([]);
    const player2LegDarts = ref([]);
    const player1Checkouts = ref([]);
    const player2Checkouts = ref([]);
    const pendingDouble = ref(null);
    const currentMatchId = ref(null);
    // Who threw first in leg 1 of this match (1 or 2). Legs alternate from there.
    const matchStarter = ref(null);
    // Set while the "Hvem starter?" dialog is open: { type: 'match' } or { type: 'leg', score }
    const starterPrompt = ref(null);
    // Shared bulls-up state from the database: { purpose, score, p1, p2, round }
    const bullsUp = ref(null);
    // Set by "Afslut kamp": the board is cleared and waits for a new match.
    const matchEnded = ref(false);
    const lastMatch = ref(null);
    const presetScores = [201, 301, 501, 701, 1000];

    // Display helpers for the redesigned UI
    const fmt = (v) => (v === null || v === undefined || v === '' || Number.isNaN(v) ? '–' : v);
    const hasWinner = computed(() => scoreboardTitle.value && scoreboardTitle.value !== 'Borg Dart');
    const legNumber = computed(() => (player1Wins.value || 0) + (player2Wins.value || 0) + (hasWinner.value ? 0 : 1));
    const formatCheckout = (c) => {
      if (!c) return '';
      if (c === 'No checkout') return 'Ingen checkout';
      return c.split(',').map(s => s.trim()).join(' · ');
    };
    const recentScores = (scores) => scores.slice(-3).reverse();

    // Focus layout: needs to know which player this phone is.
    const focusView = computed(() => {
      if (local.layout !== 'focus') return null;
      const p = route.query.player;
      if (p !== '1' && p !== '2') return null;
      const side = (n) => ({
        n,
        name: n === 1 ? player1Name.value : player2Name.value,
        score: n === 1 ? totalScores.value.player1 : totalScores.value.player2,
        checkout: n === 1 ? player1Checkout.value : player2Checkout.value,
        recent: recentScores(n === 1 ? player1Scores.value : player2Scores.value),
        avg: n === 1 ? averageScore.value.player1 : averageScore.value.player2,
        legs: (n === 1 ? player1Wins.value : player2Wins.value) || 0,
        isTurn: (n === 1) === Boolean(isPlayer1Turn.value),
      });
      const me = p === '1' ? 1 : 2;
      return { me: side(me), opp: side(me === 1 ? 2 : 1) };
    });

    const formatAverage = (avg) => {
      return avg % 1 === 0 ? avg.toString() : avg.toFixed(1);
    };

    const averageScore = computed(() => ({
      player1: player1Scores.value.length > 0 ? formatAverage(player1Scores.value.reduce((a, b) => a + b, 0) / player1Scores.value.length) : null,
      player2: player2Scores.value.length > 0 ? formatAverage(player2Scores.value.reduce((a, b) => a + b, 0) / player2Scores.value.length) : null,
    }));

    const averageSetScore = computed(() => ({
      player1: player1SetScores.value.length > 0 ? formatAverage(player1SetScores.value.reduce((a, b) => a + b, 0) / player1SetScores.value.length) : null,
      player2: player2SetScores.value.length > 0 ? formatAverage(player2SetScores.value.reduce((a, b) => a + b, 0) / player2SetScores.value.length) : null,
    }));

    const firstNineDartSetScore = computed(() => {
      const calculateFirstThreeAverage = (scores) => {
        if (scores.length < 3) return null;
        
        const firstThreeScores = scores.slice(0, 3);
        const average = firstThreeScores.reduce((acc, score) => acc + score, 0) / 3;
        
        return formatAverage(average);
      };

      return {
        player1: calculateFirstThreeAverage(player1Scores.value),
        player2: calculateFirstThreeAverage(player2Scores.value),
      };
    });

    const highestThreeDartScore = computed(() => ({
      player1: player1SetScores.value.length > 0 ? Math.max(...player1SetScores.value, 0) : null,
      player2: player2SetScores.value.length > 0 ? Math.max(...player2SetScores.value, 0) : null,
    }));
    
    const lowestThreeDartScore = computed(() => ({
      player1: player1SetScores.value.length > 0 ? Math.min(...player1SetScores.value.filter(score => score >= 0)) : null,
      player2: player2SetScores.value.length > 0 ? Math.min(...player2SetScores.value.filter(score => score >= 0)) : null,
    }));
    
    const lastTurnScorePlayer1 = computed(() => {
      return player1Scores.value.length > 0 ? player1Scores.value[player1Scores.value.length - 1] : 0;
    });

    const lastTurnScorePlayer2 = computed(() => {
      return player2Scores.value.length > 0 ? player2Scores.value[player2Scores.value.length - 1] : 0;
    });

    const secondTurnScorePlayer1 = computed(() => {
      return player1Scores.value.length > 0 ? player1Scores.value[player1Scores.value.length - 2] : "";
    });

    const secondTurnScorePlayer2 = computed(() => {
      return player2Scores.value.length > 0 ? player2Scores.value[player2Scores.value.length - 2] : "";
    });

    const thirdTurnScorePlayer1 = computed(() => {
      return player1Scores.value.length > 0 ? player1Scores.value[player1Scores.value.length - 3] : "";
    });

    const thirdTurnScorePlayer2 = computed(() => {
      return player2Scores.value.length > 0 ? player2Scores.value[player2Scores.value.length - 3] : "";
    });

    const tonStats = computed(() => {
      const count = (arr) => ({
        max: arr.filter(v => v === 180).length,
        t140: arr.filter(v => v >= 140 && v < 180).length,
        t100: arr.filter(v => v >= 100 && v < 140).length,
      });
      return { player1: count(player1SetScores.value), player2: count(player2SetScores.value) };
    });

    const finishStats = computed(() => {
      const calc = (doubleDarts, legDarts, checkouts) => {
        const attempts = doubleDarts.reduce((a, b) => a + (b || 0), 0);
        const hits = checkouts.length;
        return {
          pct: attempts > 0 ? `${Math.round((hits / attempts) * 100)}%` : null,
          big: checkouts.filter(v => v >= 100).length,
          best: legDarts.length > 0 ? Math.min(...legDarts) : null,
          avgDarts: legDarts.length > 0 ? formatAverage(legDarts.reduce((a, b) => a + b, 0) / legDarts.length) : null,
        };
      };
      return {
        player1: calc(player1DoubleDarts.value, player1LegDarts.value, player1Checkouts.value),
        player2: calc(player2DoubleDarts.value, player2LegDarts.value, player2Checkouts.value),
      };
    });

    // Called after every visit is saved. Records finishing data and, when the
    // player was on a finish, asks how many darts went at a double.
    const recordVisitExtras = (playerNum, before, isCheckout, checkoutValue) => {
      const doubleDarts = playerNum === '1' ? player1DoubleDarts : player2DoubleDarts;
      const legScores = playerNum === '1' ? player1Scores : player2Scores;
      doubleDarts.value = [...doubleDarts.value, 0];
      const changes = { [`player${playerNum}DoubleDarts`]: doubleDarts.value };
      if (isCheckout) {
        const legDarts = playerNum === '1' ? player1LegDarts : player2LegDarts;
        const checkouts = playerNum === '1' ? player1Checkouts : player2Checkouts;
        legDarts.value = [...legDarts.value, legScores.value.length * 3];
        checkouts.value = [...checkouts.value, checkoutValue];
        changes[`player${playerNum}LegDarts`] = legDarts.value;
        changes[`player${playerNum}Checkouts`] = checkouts.value;
      }
      update(dbRef, changes);
      if (shared.askDoubles && (isCheckout || (before <= 50 && before > 1))) {
        pendingDouble.value = { playerNum, before, checkout: isCheckout };
      }
    };

    const answerDouble = (n) => {
      const pending = pendingDouble.value;
      pendingDouble.value = null;
      if (!pending) return;
      const doubleDarts = pending.playerNum === '1' ? player1DoubleDarts : player2DoubleDarts;
      if (doubleDarts.value.length === 0) return;
      const next = [...doubleDarts.value];
      next[next.length - 1] = n;
      doubleDarts.value = next;
      update(dbRef, { [`player${pending.playerNum}DoubleDarts`]: next });
    };

    const historyLink = computed(() => ({ path: '/historik', query: route.query }));

    // Keep the running match's snapshot in history/matches up to date.
    const saveMatchSnapshot = (data) => {
      const id = data.currentMatchId;
      if (!id) return;
      const snapshot = {
        startedAt: data.matchStartedAt || Date.now(),
        updatedAt: Date.now(),
        startScore: data.startScore || 501,
        players: {
          p1: buildPlayerSnapshot({
            name: data.player1Name || 'Player 1',
            legs: data.player1Wins || 0,
            setScores: data.player1SetScores || [],
            highestCheckout: data.player1HighestCheckout,
            checkouts: data.player1Checkouts,
            doubleDarts: data.player1DoubleDarts,
            legDarts: data.player1LegDarts,
          }),
          p2: buildPlayerSnapshot({
            name: data.player2Name || 'Player 2',
            legs: data.player2Wins || 0,
            setScores: data.player2SetScores || [],
            highestCheckout: data.player2HighestCheckout,
            checkouts: data.player2Checkouts,
            doubleDarts: data.player2DoubleDarts,
            legDarts: data.player2LegDarts,
          }),
        },
      };
      set(firebaseRef(database, `history/matches/${id}`), snapshot).catch(err => console.error('Kunne ikke gemme kamp:', err));
    };

    let stopListening = null;
    const fetchScores = () => {
      stopListening = onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          totalScores.value = data;
          isPlayer1Turn.value = data.isPlayer1Turn;
          scoreboardTitle.value = data.scoreboardTitle || 'Borg Dart';
          player1Name.value = data.player1Name || 'Player 1';
          player2Name.value = data.player2Name || 'Player 2';
          player1Wins.value = data.player1Wins || 0;
          player2Wins.value = data.player2Wins || 0;
          player1Checkout.value = data.player1Checkout || "";
          player2Checkout.value = data.player2Checkout || "";
          player1Scores.value = data.player1Scores || []; 
          player2Scores.value = data.player2Scores || [];
          player1SetScores.value = data.player1SetScores || []; 
          player2SetScores.value = data.player2SetScores || [];
          player1HighestCheckout.value = data.player1HighestCheckout || null;
          player2HighestCheckout.value = data.player2HighestCheckout || null;
          player1LowestCheckout.value = data.player1LowestCheckout || null;
          player2LowestCheckout.value = data.player2LowestCheckout || null;
          startScore.value = data.startScore || 501;
          matchStarter.value = data.matchStarter === 1 || data.matchStarter === 2 ? data.matchStarter : null;
          matchEnded.value = Boolean(data.matchEnded);
          lastMatch.value = data.lastMatch || null;
          bullsUp.value = data.bullsUp && data.bullsUp.purpose ? data.bullsUp : null;
          player1DoubleDarts.value = data.player1DoubleDarts || [];
          player2DoubleDarts.value = data.player2DoubleDarts || [];
          player1LegDarts.value = data.player1LegDarts || [];
          player2LegDarts.value = data.player2LegDarts || [];
          player1Checkouts.value = data.player1Checkouts || [];
          player2Checkouts.value = data.player2Checkouts || [];
          currentMatchId.value = data.currentMatchId || null;
          saveMatchSnapshot(data);
        }
      });
    };
    
    function updateCurrentScore(num) {
      buzz();
      currentScore.value = `${currentScore.value}${num}`;
    }

    const submitScore = () => {
      buzz();
      if (matchEnded.value) {
        showAlert('Start en ny kamp først.', { title: 'Ingen kamp i gang' });
        return;
      }
      const playerNum = route.query.player;
      if (!playerNum || (playerNum !== '1' && playerNum !== '2')) {
        showAlert('Vælg først hvilken spiller du er.', { title: 'Hvem er du?' });
        return;
      }

      if ((playerNum === '1' && !isPlayer1Turn.value) || (playerNum === '2' && isPlayer1Turn.value)) {
        showAlert('Vent til det er din tur.', { title: 'Ikke din tur, klovn!' });
        return;
      }
      
      const scoreInput = parseInt(currentScore.value);

      // If nothing is inputted, just switch turns
      if (isNaN(scoreInput)) {
        currentScore.value = '';
        if (playerNum === '1') {
          player1Scores.value.push(0);
          player1SetScores.value.push(0);
          update(dbRef, { player1Scores: player1Scores.value, player1SetScores: player1SetScores.value, isPlayer1Turn: !isPlayer1Turn.value });
        } else {
          player2Scores.value.push(0);
          player2SetScores.value.push(0);
          update(dbRef, { player2Scores: player2Scores.value, player2SetScores: player2SetScores.value, isPlayer1Turn: !isPlayer1Turn.value });
        }
        recordVisitExtras(playerNum, totalScores.value[`player${playerNum}`], false, 0);
        return;
      }

      if (scoreInput > 180) {
        showAlert('En runde kan højst give 180 point.', { title: 'Duuude' });
        currentScore.value = '';
        return;
      }

      const playerKey = `player${playerNum}`;
      const scoreBefore = totalScores.value[playerKey];
      let newScore = scoreBefore - scoreInput;

      if (newScore < 0 && !shared.doubleOut) {
        showAlert(`Du har ${scoreBefore} tilbage, så ${scoreInput} er for meget.`, { title: 'Under 0' });
        currentScore.value = '';
        return;
      }
      if (shared.doubleOut && (newScore < 0 || newScore === 1)) {
        // Bust: the visit counts as 0 and the turn passes.
        currentScore.value = '';
        if (playerNum === '1') {
          player1Scores.value.push(0);
          player1SetScores.value.push(0);
          update(dbRef, { player1Scores: player1Scores.value, player1SetScores: player1SetScores.value, isPlayer1Turn: !isPlayer1Turn.value });
        } else {
          player2Scores.value.push(0);
          player2SetScores.value.push(0);
          update(dbRef, { player2Scores: player2Scores.value, player2SetScores: player2SetScores.value, isPlayer1Turn: !isPlayer1Turn.value });
        }
        recordVisitExtras(playerNum, scoreBefore, false, 0);
        showAlert(`Du havde ${scoreBefore} tilbage. ${scoreInput} giver bust, så runden tæller 0.`, { title: 'Bust!' });
        return;
      }
      if (newScore === 0) {
        const winnerName = playerNum === '1' ? player1Name.value : player2Name.value;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        const winnerKey = playerKey === 'player1' ? 'player1Wins' : 'player2Wins';
        const updatedWins = (winnerKey === 'player1Wins' ? player1Wins.value : player2Wins.value) + 1;
        const wonMatch = shared.legsToWin > 0 && updatedWins >= shared.legsToWin;
        const winAnnouncement = wonMatch ? `${winnerName} vandt kampen!` : `${winnerName} vandt!`;

        // Update the highest checkout if applicable
        if (playerNum === '1') {
          if (scoreInput > player1HighestCheckout.value) {
            player1HighestCheckout.value = scoreInput;
            update(dbRef, { player1HighestCheckout: scoreInput });
          }
          if (scoreInput < player1LowestCheckout.value || player1LowestCheckout.value == null) {
            player1LowestCheckout.value = scoreInput;
            update(dbRef, { player1LowestCheckout: scoreInput });
          }
        } else {
          if (scoreInput > player2HighestCheckout.value) {
            player2HighestCheckout.value = scoreInput;
            update(dbRef, { player2HighestCheckout: scoreInput });
          }
          if (scoreInput < player2LowestCheckout.value || player2LowestCheckout.value == null) {
            player2LowestCheckout.value = scoreInput;
            update(dbRef, { player2LowestCheckout: scoreInput });
          }
        }

        // Update the database with the new score and winner details
        // The first won leg opens a match in the history
        const matchFields = {};
        if (!currentMatchId.value) {
          matchFields.currentMatchId = push(firebaseRef(database, 'history/matches')).key;
          matchFields.matchStartedAt = Date.now();
          currentMatchId.value = matchFields.currentMatchId;
        }
        update(dbRef, { [playerKey]: newScore, [winnerKey]: updatedWins, scoreboardTitle: winAnnouncement, ...matchFields });

        currentScore.value = '';

        // Add the score to the player's scores history
        if (playerNum === '1') {
          player1Scores.value.push(scoreInput);
          player1SetScores.value.push(scoreInput);
          update(dbRef, { player1Scores: player1Scores.value, player1SetScores: player1SetScores.value });
        } else {
          player2Scores.value.push(scoreInput);
          player2SetScores.value.push(scoreInput);
          update(dbRef, { player2Scores: player2Scores.value, player2SetScores: player2SetScores.value });
        }
        recordVisitExtras(playerNum, scoreBefore, true, scoreInput);

        return;
      } else {
        // Update the database with the new score
        update(dbRef, { [playerKey]: newScore });
        currentScore.value = '';

        // Add the score to the player's scores history
        if (playerNum === '1') {
          player1Scores.value.push(scoreInput);
          player1SetScores.value.push(scoreInput);
          update(dbRef, { player1Scores: player1Scores.value, player1SetScores: player1SetScores.value });
        } else {
          player2Scores.value.push(scoreInput);
          player2SetScores.value.push(scoreInput);
          update(dbRef, { player2Scores: player2Scores.value, player2SetScores: player2SetScores.value  });
        }  

        // Update the highest checkout score if applicable
        if (newScore <= 170) {
          const checkoutOption = getDartsCheckout(newScore);
          const playerKeyCheckout = playerKey === 'player1' ? 'player1Checkout' : 'player2Checkout';
          update(dbRef, { [playerKeyCheckout]: checkoutOption });
        }

        recordVisitExtras(playerNum, scoreBefore, false, 0);

        // Update isPlayer1Turn after submitting the score
        update(dbRef, { isPlayer1Turn: !isPlayer1Turn.value });
      }
    };

    // Starter of a given leg: the match starter on odd legs, the other player on even legs.
    const starterForLeg = (legNo, starter) => (legNo % 2 === 1 ? starter : (starter === 1 ? 2 : 1));
    const matchOver = computed(() => hasWinner.value && shared.legsToWin > 0
      && Math.max(player1Wins.value || 0, player2Wins.value || 0) >= shared.legsToWin);
    const legStarter = computed(() => (matchStarter.value ? starterForLeg(legNumber.value, matchStarter.value) : null));

    // Reset the board for a new leg. The leg number is the legs won so far + 1.
    const startLeg = (score, starter = matchStarter.value) => {
      if (!starter) {
        starterPrompt.value = { type: 'leg', score };
        return;
      }
      const nextLeg = (player1Wins.value || 0) + (player2Wins.value || 0) + 1;
      update(dbRef, {
        player1Checkout: "",
        player2Checkout: "",
        isPlayer1Turn: starterForLeg(nextLeg, starter) === 1,
        matchStarter: starter,
        player1: score,
        player2: score,
        startScore: score,
        player1Scores: [],
        player2Scores: [],
        scoreboardTitle: 'Borg Dart'
      });
    };

    const setPredefinedScore = async (score) => {
      if (await showConfirm(`Begge spillere starter forfra på ${score}.`, { title: 'Nulstil leg?', confirmText: 'Nulstil' })) {
        startLeg(score);
      }
    };

    const switchTurns = () => {
      // Toggle isPlayer1Turn and update it in the database
      update(dbRef, { isPlayer1Turn: !isPlayer1Turn.value });
    };

    const resetWins = async () => {
      if (await showConfirm('Den nuværende kamp er gemt i historikken.', { title: 'Start ny kamp?', confirmText: 'Ny kamp' })) {
        starterPrompt.value = { type: 'match', score: shared.defaultStartScore || 501 };
      }
    };

    // Clear the whole match and begin leg 1 with the chosen starter.
    // Everything that belongs to one match, reset to a clean board.
    const freshMatchFields = (score) => ({
      player1Wins: 0,
      player2Wins: 0,
      player1Checkout: '',
      player2Checkout: '',
      lastTurnScorePlayer1: 0,
      lastTurnScorePlayer2: 0,
      secondTurnScorePlayer1: '',
      secondTurnScorePlayer2: '',
      thirdTurnScorePlayer1: '',
      thirdTurnScorePlayer2: '',
      player1: score,
      player2: score,
      startScore: score,
      player1Scores: [],
      player2Scores: [],
      player1SetScores: [],
      player2SetScores: [],
      player1HighestCheckout: null,
      player2HighestCheckout: null,
      player1LowestCheckout: null,
      player2LowestCheckout: null,
      player1DoubleDarts: [],
      player2DoubleDarts: [],
      player1LegDarts: [],
      player2LegDarts: [],
      player1Checkouts: [],
      player2Checkouts: [],
      currentMatchId: null,
      matchStartedAt: null,
      bullsUp: null,
      scoreboardTitle: 'Borg Dart',
    });

    const startNewMatch = (starter, score = shared.defaultStartScore || 501) => {
      update(dbRef, {
        ...freshMatchFields(score),
        isPlayer1Turn: starter === 1,
        matchStarter: starter,
        matchEnded: null,
      });
    };

    // Stop the current match without starting a new one. It stays in the history.
    const endMatch = async () => {
      const saved = Boolean(currentMatchId.value);
      const msg = saved
        ? 'Kampen er gemt i historikken. Scoreboardet ryddes, og I kan starte en ny kamp, når I er klar.'
        : 'Ingen har vundet et leg endnu, så kampen bliver ikke gemt. Scoreboardet ryddes.';
      if (!(await showConfirm(msg, { title: 'Afslut kamp?', confirmText: 'Afslut' }))) return;
      update(dbRef, {
        ...freshMatchFields(shared.defaultStartScore || 501),
        isPlayer1Turn: true,
        matchStarter: null,
        matchEnded: true,
        lastMatch: {
          p1Name: player1Name.value,
          p2Name: player2Name.value,
          p1Legs: player1Wins.value || 0,
          p2Legs: player2Wins.value || 0,
          saved,
          endedAt: Date.now(),
        },
      });
    };

    const openNewMatch = () => {
      starterPrompt.value = { type: 'match', score: shared.defaultStartScore || 501 };
    };

    // ---- bulls up (synced, so both phones see the same panel)
    const chooseBull = () => {
      const pending = starterPrompt.value;
      starterPrompt.value = null;
      if (!pending) return;
      update(dbRef, { bullsUp: { purpose: pending.type, score: pending.score || null, p1: null, p2: null, round: 1 } });
    };
    // A phone can only enter the result for its own seat.
    const bullOwnIndex = computed(() => (route.query.player === '2' ? 1 : 0));
    const setBull = (i, value) => {
      if (i !== bullOwnIndex.value) return;
      update(dbRef, { [`bullsUp/p${i + 1}`]: value });
    };
    const bullRethrow = () => update(dbRef, {
      'bullsUp/p1': null, 'bullsUp/p2': null, 'bullsUp/round': ((bullsUp.value && bullsUp.value.round) || 1) + 1,
    });
    const bullCancel = () => update(dbRef, { bullsUp: null });
    const bullStart = (i) => {
      const state = bullsUp.value;
      if (!state) return;
      const winner = i + 1;
      update(dbRef, { bullsUp: null });
      if (state.purpose === 'match') startNewMatch(winner, state.score || shared.defaultStartScore || 501);
      else startLeg(state.score || startScore.value, winner);
    };

    const chooseStarter = (n) => {
      const pending = starterPrompt.value;
      starterPrompt.value = null;
      if (!pending) return;
      if (pending.type === 'match') startNewMatch(n, pending.score);
      else startLeg(pending.score, n);
    };

    const undoLastTurn = async () => {
      const playerNum = isPlayer1Turn.value ? '2' : '1'; // If it's now player 1's turn, it means the last turn was player 2's, and vice versa
      const playerKey = `player${playerNum}`;
      const lastTurnScoreKey = `lastTurnScorePlayer${playerNum}`;
      const lastTurnScore = playerNum === '1' ? lastTurnScorePlayer1.value : lastTurnScorePlayer2.value;
      const lastName = playerNum === '1' ? player1Name.value : player2Name.value;
      if (await showConfirm(`${lastName} får ${lastTurnScore} point tilbage, og turen går tilbage.`, { title: 'Fortryd tur?', confirmText: 'Fortryd' })) {
        update(dbRef, {
          [playerKey]: totalScores.value[playerKey] + lastTurnScore,
          [lastTurnScoreKey]: 0
        }).then(() => {
          // Update local state after successful database update
          if (playerNum === '1') {
            totalScores.value.player1 += lastTurnScore;
            lastTurnScorePlayer1.value = 0;
            player1Scores.value.pop(); 
            player1SetScores.value.pop(); 
            if (player1DoubleDarts.value.length > player1SetScores.value.length) player1DoubleDarts.value = player1DoubleDarts.value.slice(0, -1);
            update(dbRef, { player1Scores: player1Scores.value, player1SetScores: player1SetScores.value, player1DoubleDarts: player1DoubleDarts.value });
          } else {
            totalScores.value.player2 += lastTurnScore;
            lastTurnScorePlayer2.value = 0;
            player2Scores.value.pop();
            player2SetScores.value.pop();
            if (player2DoubleDarts.value.length > player2SetScores.value.length) player2DoubleDarts.value = player2DoubleDarts.value.slice(0, -1);
            update(dbRef, { player2Scores: player2Scores.value, player2SetScores: player2SetScores.value, player2DoubleDarts: player2DoubleDarts.value });
          }
          // Optionally switch turns back
          isPlayer1Turn.value = !isPlayer1Turn.value;
          update(dbRef, { isPlayer1Turn: isPlayer1Turn.value });
        }).catch(error => {
          console.error("Error undoing last turn:", error);
        });
      }
    };

    const changePlayerName = async (playerNumber) => {
      const current = playerNumber === 1 ? player1Name.value : player2Name.value;
      const newName = await showPrompt('', { title: `Navn, spiller ${playerNumber}`, value: current, placeholder: 'Navn', confirmText: 'Gem' });
      if (newName && newName.trim() !== '') {
        const playerNameKey = `player${playerNumber}Name`;
        update(dbRef, { [playerNameKey]: newName.trim() });
        if (local.seat === playerNumber) local.name = newName.trim();
      }
    };

    function deleteLastNum() {
      buzz();
      if (currentScore.value.length > 0) {
        currentScore.value = currentScore.value.slice(0, -1);
      }
    }

    // ---- voice input: only on this phone's turn, with nothing else open
    const myTurnHere = computed(() => {
      const p = route.query.player;
      if (p !== '1' && p !== '2') return false;
      const mine = (p === '1') === Boolean(isPlayer1Turn.value);
      return mine && !matchEnded.value && !pendingDouble.value && !dialogState.open && !bullsUp.value && !starterPrompt.value && !needsPlayer.value;
    });
    const voice = useVoiceInput({
      canScore: () => myTurnHere.value,
      onScore: (n) => { currentScore.value = String(n); submitScore(); },
      sheetOpen: () => Boolean(pendingDouble.value),
      onDarts: (n) => answerDouble(n),
    });

    onMounted(fetchScores);
    onUnmounted(() => { if (stopListening) stopListening(); });

    return { 
      totalScores, 
      currentScore, 
      submitScore, 
      setPredefinedScore, 
      updateCurrentScore, 
      isPlayer1Turn, 
      scoreboardTitle, 
      switchTurns,
      changePlayerName,
      player1Name,
      player2Name,
      deleteLastNum,
      player1Wins,
      player2Wins,
      resetWins,
      lastTurnScorePlayer1,
      lastTurnScorePlayer2,
      secondTurnScorePlayer1,
      secondTurnScorePlayer2,
      thirdTurnScorePlayer1,
      thirdTurnScorePlayer2,
      undoLastTurn,
      player1Checkout,
      player2Checkout,
      player1HighestCheckout,
      player2HighestCheckout,
      player1LowestCheckout,
      player2LowestCheckout,
      averageScore,
      averageSetScore,
      firstNineDartSetScore,
      highestThreeDartScore,
      lowestThreeDartScore,
      player1Scores,
      player2Scores,
      startScore,
      presetScores,
      fmt,
      hasWinner,
      legNumber,
      formatCheckout,
      recentScores,
      needsPlayer,
      choosePlayer,
      tonStats,
      finishStats,
      pendingDouble,
      answerDouble,
      historyLink,
      starterPrompt,
      chooseStarter,
      startLeg,
      legStarter,
      matchOver,
      bullsUp,
      matchEnded,
      lastMatch,
      endMatch,
      openNewMatch,
      bullOwnIndex,
      voice,
      focusView,
      chooseBull,
      setBull,
      bullRethrow,
      bullCancel,
      bullStart,
      shared
    };
  }
};
</script>

<style scoped>
.dart-score {

  color: var(--text);
  font-family: 'Barlow', system-ui, sans-serif;
  padding: 16px 16px 32px;
  box-sizing: border-box;
  text-align: left;
}

.dart-score *,
.dart-score *::before,
.dart-score *::after {
  box-sizing: border-box;
}

button {
  font: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.layout {
  max-width: 440px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.col-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Header */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-word {
  font-family: var(--display);
  font-weight: 800;
  font-size: 24px;
  letter-spacing: 0.02em;
  line-height: 1;
}

.accent {
  color: var(--accent);
}

.top-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.icon-link {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid var(--line);
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s, border-color 0.15s;
}

.icon-link:hover {
  color: var(--text);
  border-color: var(--accent);
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
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.winner-banner {
  background: var(--accent);
  color: var(--on-accent);
  font-family: var(--display);
  font-weight: 800;
  font-size: 24px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-radius: 12px;
  padding: 8px 8px 8px 16px;
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

.next-leg:hover {
  background: var(--key2);
}

.starter-tag {
  align-self: flex-start;
  margin-top: -2px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--muted);
}

.bull-choice {
  width: 100%;
  margin-top: 10px;
  height: 52px;
  border: 1px dashed var(--accent);
  border-radius: 14px;
  background: transparent;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--display);
  font-weight: 800;
  font-size: 19px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.bull-choice svg {
  color: var(--accent);
}

.bull-choice:hover {
  background: var(--key);
}

.picker-cancel {
  margin-top: 8px;
  height: 44px;
  padding: 0 16px;
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: 14px;
  font-weight: 600;
}

.picker-cancel:hover {
  color: var(--text);
}

/* Scoreboard */
.score-display {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 52px minmax(0, 1fr);
  gap: 8px;
  margin-top: 6px;
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
  background: none;
  border: 0;
  padding: 0;
  color: var(--text);
  text-align: left;
  font-family: var(--display);
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.name:hover {
  color: var(--soft);
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

.checkout.none,
.player-card.active .checkout.none {
  background: transparent;
  color: var(--muted);
  padding: 2px 0;
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

/* Idle (no match running) */
.idle {
  margin-top: 24px;
  background: var(--surface);
  border-radius: 20px;
  padding: 28px 20px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  color: var(--text);
}

.idle > svg {
  color: var(--accent);
}

.idle-title {
  margin: 0;
  font-family: var(--display);
  font-weight: 800;
  font-size: 30px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.idle-last {
  width: 100%;
  background: var(--bg);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.idle-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--muted);
}

.idle-result {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  font-family: var(--display);
  font-weight: 700;
  font-size: 19px;
  text-transform: uppercase;
  color: var(--soft);
}

.idle-result > span:first-child {
  text-align: right;
}

.idle-result > span:last-child {
  text-align: left;
}

.idle-result .won {
  color: var(--text);
}

.idle-legs {
  font-weight: 800;
  font-size: 28px;
  color: var(--text);
}

.idle-legs .sep {
  color: var(--faint);
  margin: 0 4px;
}

.idle-note {
  font-size: 12px;
  color: var(--muted);
}

.idle-start {
  width: 100%;
  height: 56px;
  margin-top: 4px;
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

.idle-start:hover {
  background: var(--accent-hover);
}

.idle-link {
  color: var(--muted);
  font-size: 14px;
  font-weight: 600;
  padding: 8px;
}

.idle-link:hover {
  color: var(--text);
}

/* Focus view */
.focus {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
}

.focus-card {
  position: relative;
  background: var(--surface);
  border: 2px solid var(--surface);
  border-radius: 20px;
  padding: 16px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.2s;
}

.focus-card.active {
  border-color: var(--accent);
}

.focus-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.focus-avg {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--muted);
  white-space: nowrap;
}

.focus-avg strong {
  color: var(--text);
}

.focus-main {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.focus-score {
  font-family: var(--display);
  font-weight: 800;
  font-size: clamp(88px, 30vw, 120px);
  line-height: 0.82;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.focus-co {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  min-width: 0;
  padding-bottom: 4px;
}

.focus-co-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--muted);
}

.focus-co-value {
  font-family: var(--display);
  font-weight: 800;
  font-size: 22px;
  color: var(--gold-text);
  text-align: right;
  line-height: 1.05;
}

.focus-co-value.none {
  color: var(--muted);
  font-size: 15px;
}

.focus-recent {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.focus-recent span {
  background: var(--bg);
  border-radius: 8px;
  padding: 8px;
  text-align: center;
  font-family: var(--display);
  font-weight: 700;
  font-size: 18px;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.focus-recent span.first {
  color: var(--text);
}

.focus-opp {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 14px;
  background: var(--surface);
  border: 1px solid transparent;
  min-height: 56px;
}

.focus-opp.active {
  border-color: var(--accent);
}

.focus-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
  background: var(--line);
}

.focus-opp.active .focus-dot {
  background: var(--accent);
}

.opp-name {
  background: none;
  border: 0;
  padding: 0;
  color: var(--soft);
  font-family: var(--display);
  font-weight: 700;
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  cursor: pointer;
}

.opp-turn {
  font-family: var(--display);
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 0.1em;
  background: var(--accent);
  color: var(--on-accent);
  border-radius: 999px;
  padding: 2px 7px;
}

.opp-co {
  font-family: var(--display);
  font-size: 14px;
  font-weight: 600;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.opp-score {
  margin-left: auto;
  font-family: var(--display);
  font-weight: 800;
  font-size: 32px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--soft);
}

.opp-legs {
  font-family: var(--display);
  font-weight: 700;
  font-size: 15px;
  background: var(--bg);
  border-radius: 8px;
  padding: 5px 8px;
  color: var(--text);
  white-space: nowrap;
}

.opp-legs .sep {
  color: var(--faint);
  margin: 0 2px;
}

/* Input + keypad */
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

.score-label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--muted);
}

#scoreInput {
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

#scoreInput::placeholder {
  color: var(--placeholder);
}

#scoreInput::-webkit-outer-spin-button,
#scoreInput::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
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
  transition: background-color 0.1s, transform 0.05s;
}

.key:hover {
  background: var(--key-hover);
}

.key:active {
  transform: scale(0.97);
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

.key.enter:hover {
  background: var(--accent-hover);
}

/* Settings */
.settings {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}

.section-title {
  margin: 0;
  font-family: var(--display);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.14em;
  color: var(--muted);
}

.segmented {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
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
  font-size: 19px;
  font-weight: 700;
}

.segmented button:hover {
  color: var(--text);
}

.segmented button.selected {
  background: var(--accent);
  color: var(--on-accent);
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

.actions button:hover {
  background: var(--surface);
}

.actions button.danger {
  color: var(--danger);
}

/* Stats */
.col-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stats {
  background: var(--surface);
  border-radius: 14px;
  padding: 4px 14px;
  font-variant-numeric: tabular-nums;
}

.stats-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 80px 80px;
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
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stats-row.head span.accent {
  color: var(--accent);
}

.gold {
  color: var(--gold-text);
}

.stats-group {
  padding: 14px 0 4px;
  font-family: var(--display);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
}

/* Darts-at-double sheet */
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
  letter-spacing: 0.02em;
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

/* Player picker */
.picker-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10;
  background: var(--backdrop);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.picker {
  width: 100%;
  max-width: 400px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 28px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

.picker-title {
  margin: 8px 0 0;
  font-family: var(--display);
  font-weight: 800;
  font-size: 32px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.picker-sub {
  margin: 0 0 12px;
  color: var(--muted);
  font-size: 15px;
}

.picker-label {
  align-self: stretch;
  margin-top: 10px;
  font-family: var(--display);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.14em;
  color: var(--muted);
  text-align: left;
}

.game-pick {
  align-self: stretch;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 4px;
  background: var(--bg);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 4px;
}

.game-pick button {
  height: 44px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--muted);
  font-family: var(--display);
  font-weight: 700;
  font-size: 18px;
}

.game-pick button:hover {
  color: var(--text);
}

.game-pick button.selected {
  background: var(--accent);
  color: var(--on-accent);
}

.picker-options {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.picker-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-height: 96px;
  padding: 16px 14px;
  border: 2px solid var(--line);
  border-radius: 14px;
  background: var(--key);
  color: var(--text);
  text-align: left;
  transition: border-color 0.15s, background-color 0.15s;
}

.picker-option:hover,
.picker-option:focus-visible {
  border-color: var(--accent);
  background: var(--key-hover);
  outline: none;
}

.picker-num {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--muted);
}

.picker-name {
  font-family: var(--display);
  font-weight: 800;
  font-size: 24px;
  line-height: 1.05;
  text-transform: uppercase;
  max-width: 100%;
  overflow-wrap: anywhere;
}

/* Wide screens: stats beside the game */
@media screen and (min-width: 900px) {
  .layout {
    max-width: 880px;
    flex-direction: row;
    align-items: flex-start;
  }

  .col-main {
    flex: 0 0 440px;
  }

  .col-stats {
    flex: 1;
    margin-top: 60px;
  }
}
</style>

<template>
  <div class="history">
    <div class="wrap">
      <header class="topbar">
        <router-link :to="backLink" class="icon-link" aria-label="Tilbage til scoreboard" title="Tilbage">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        </router-link>
        <div class="brand">
          <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
            <rect x="0" y="0" width="48" height="48" rx="12" fill="#5B95FF" />
            <path d="M15 10v28M15 10h10a7 7 0 0 1 0 14H15M15 24h12a7 7 0 0 1 0 14H15" fill="none" stroke="#0E0F12" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="25" cy="17" r="2.6" fill="#0E0F12" />
          </svg>
          <h1 class="page-title">HISTORIK</h1>
        </div>
        <div class="spacer"></div>
      </header>

      <p v-if="loading" class="empty">Henter kampe…</p>

      <div v-else-if="matches.length === 0" class="empty-card">
        <h2>Ingen kampe endnu</h2>
        <p>En kamp gemmes automatisk, så snart det første leg er vundet. Tryk "Ny kamp" for at afslutte en kamp og starte en ny.</p>
      </div>

      <template v-else>
        <!-- Head-to-head -->
        <section class="block">
          <h2 class="section-title">HEAD-TO-HEAD</h2>
          <div class="h2h-pickers">
            <label class="picker-field">
              <span class="sr-only">Spiller A</span>
              <select v-model="playerA">
                <option v-for="n in names" :key="'a-' + n" :value="n">{{ n }}</option>
              </select>
            </label>
            <span class="vs">VS</span>
            <label class="picker-field">
              <span class="sr-only">Spiller B</span>
              <select v-model="playerB">
                <option v-for="n in names" :key="'b-' + n" :value="n">{{ n }}</option>
              </select>
            </label>
          </div>

          <div v-if="h2h.matches.length === 0" class="empty-card small">
            <p>{{ playerA }} og {{ playerB }} har ikke spillet mod hinanden endnu.</p>
          </div>

          <div v-else class="card">
            <div class="h2h-score">
              <div class="h2h-side">
                <div class="h2h-name">{{ playerA }}</div>
                <div class="h2h-big" :class="{ lead: h2h.a.matchWins > h2h.b.matchWins }">{{ h2h.a.matchWins }}</div>
              </div>
              <div class="h2h-mid">
                <div class="h2h-label">KAMPE</div>
                <div class="h2h-dash">–</div>
                <div v-if="h2h.draws" class="h2h-draws">{{ h2h.draws }} uafgjort</div>
              </div>
              <div class="h2h-side right">
                <div class="h2h-name">{{ playerB }}</div>
                <div class="h2h-big" :class="{ lead: h2h.b.matchWins > h2h.a.matchWins }">{{ h2h.b.matchWins }}</div>
              </div>
            </div>

            <div class="rows">
              <div v-for="row in h2hRows" :key="row.label" class="row">
                <span :class="{ win: row.winner === 'a' }">{{ row.a }}</span>
                <span class="row-label">{{ row.label }}</span>
                <span :class="{ win: row.winner === 'b' }">{{ row.b }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Records -->
        <section class="block">
          <h2 class="section-title">REKORDER</h2>
          <div class="records">
            <div v-for="r in recordCards" :key="r.label" class="record">
              <div class="record-label">{{ r.label }}</div>
              <div class="record-value" :class="{ gold: r.gold }">{{ r.value }}</div>
              <div class="record-who">{{ r.who }}</div>
            </div>
          </div>
        </section>

        <!-- Match list -->
        <section class="block">
          <h2 class="section-title">KAMPE</h2>
          <ul class="matches">
            <li v-for="m in matches" :key="m.id" class="match">
              <div class="match-head">
                <span class="match-date">{{ formatDate(m.startedAt) }} · {{ m.startScore || 501 }}</span>
                <span class="match-tools">
                  <span v-if="m.id === currentMatchId" class="live-tag">I GANG</span>
                  <button type="button" class="delete" :aria-label="'Slet kamp ' + formatDate(m.startedAt)" @click="deleteMatch(m)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></svg>
                    Slet
                  </button>
                </span>
              </div>
              <div class="match-body">
                <div class="match-player" :class="{ won: m.players.p1.legs > m.players.p2.legs }">
                  <span class="mp-name">{{ m.players.p1.name }}</span>
                  <span class="mp-avg">AVG {{ formatNumber(average(m.players.p1.scored, m.players.p1.visits)) }}</span>
                </div>
                <div class="match-legs">
                  <span :class="{ lead: m.players.p1.legs > m.players.p2.legs }">{{ m.players.p1.legs }}</span>
                  <span class="dash">–</span>
                  <span :class="{ lead: m.players.p2.legs > m.players.p1.legs }">{{ m.players.p2.legs }}</span>
                </div>
                <div class="match-player right" :class="{ won: m.players.p2.legs > m.players.p1.legs }">
                  <span class="mp-name">{{ m.players.p2.name }}</span>
                  <span class="mp-avg">AVG {{ formatNumber(average(m.players.p2.scored, m.players.p2.visits)) }}</span>
                </div>
              </div>
            </li>
          </ul>
          <button type="button" class="delete-all" @click="deleteAll">Slet alle kampe</button>
        </section>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { getDatabase, ref as firebaseRef, onValue, remove, update } from 'firebase/database';
import {
  matchList, playerNames, headToHead, records, average, formatNumber, formatPct, formatDate, normalizeName,
} from '@/matchHistory';
import { showConfirm } from '@/dialog';

export default {
  setup() {
    const route = useRoute();
    const database = getDatabase();
    const loading = ref(true);
    const raw = ref(null);
    const currentMatchId = ref(null);
    const scoreboardNames = ref([]);
    const playerA = ref('');
    const playerB = ref('');
    const unsubscribers = [];

    const backLink = computed(() => ({ path: '/', query: route.query }));
    const matches = computed(() => matchList(raw.value));
    const names = computed(() => playerNames(matches.value));

    // Default the head-to-head to the two players on the scoreboard, else the
    // pair from the most recent match.
    const pickDefaults = () => {
      if (playerA.value && playerB.value) return;
      const list = names.value;
      const find = (n) => list.find(x => normalizeName(x) === normalizeName(n));
      const [s1, s2] = scoreboardNames.value.map(find);
      if (s1 && s2 && s1 !== s2) {
        playerA.value = s1;
        playerB.value = s2;
      } else if (matches.value.length) {
        playerA.value = find(matches.value[0].players.p1.name) || list[0] || '';
        playerB.value = find(matches.value[0].players.p2.name) || list[1] || '';
      }
    };
    watch([names, scoreboardNames], pickDefaults);

    const h2h = computed(() => headToHead(matches.value, playerA.value, playerB.value));

    const h2hRows = computed(() => {
      const { a, b } = h2h.value;
      const avgA = average(a.scored, a.visits);
      const avgB = average(b.scored, b.visits);
      const pctA = a.doubleDarts > 0 ? a.checkouts / a.doubleDarts : null;
      const pctB = b.doubleDarts > 0 ? b.checkouts / b.doubleDarts : null;
      const higher = (x, y) => (x === null || y === null || x === y ? null : (x > y ? 'a' : 'b'));
      const lower = (x, y) => (x === null || y === null || x === y ? null : (x < y ? 'a' : 'b'));
      return [
        { label: 'Legs vundet', a: a.legs, b: b.legs, winner: higher(a.legs, b.legs) },
        { label: 'Gennemsnit', a: formatNumber(avgA), b: formatNumber(avgB), winner: higher(avgA, avgB) },
        { label: '180', a: a.n180, b: b.n180, winner: higher(a.n180, b.n180) },
        { label: '140+', a: a.n140, b: b.n140, winner: higher(a.n140, b.n140) },
        { label: '100+', a: a.n100, b: b.n100, winner: higher(a.n100, b.n100) },
        { label: 'Højeste score', a: a.highScore || '–', b: b.highScore || '–', winner: higher(a.highScore, b.highScore) },
        { label: 'Højeste checkout', a: a.highestCheckout || '–', b: b.highestCheckout || '–', winner: higher(a.highestCheckout, b.highestCheckout) },
        { label: 'Checkout %', a: formatPct(a.checkouts, a.doubleDarts), b: formatPct(b.checkouts, b.doubleDarts), winner: higher(pctA, pctB) },
        { label: 'Bedste leg', a: a.bestLeg !== null ? `${a.bestLeg} darts` : '–', b: b.bestLeg !== null ? `${b.bestLeg} darts` : '–', winner: lower(a.bestLeg, b.bestLeg) },
      ];
    });

    const recordCards = computed(() => {
      const r = records(matches.value);
      const who = (rec) => (rec ? `${rec.name} · ${formatDate(rec.date)}` : 'Ingen endnu');
      return [
        { label: 'Højeste checkout', value: r.highestCheckout ? r.highestCheckout.value : '–', who: who(r.highestCheckout), gold: true },
        { label: 'Bedste leg', value: r.bestLeg ? `${r.bestLeg.value} darts` : '–', who: who(r.bestLeg) },
        { label: 'Højeste kampgns.', value: r.bestAverage ? formatNumber(r.bestAverage.value) : '–', who: who(r.bestAverage) },
        { label: 'Flest 180 i en kamp', value: r.most180 ? r.most180.value : '–', who: who(r.most180) },
      ];
    });

    // Forget the running match id so the scoreboard doesn't write it back.
    const detachCurrentMatch = () => update(firebaseRef(database, 'scores'), { currentMatchId: null, matchStartedAt: null });

    const deleteMatch = async (m) => {
      const label = `${m.players.p1.name} ${m.players.p1.legs}–${m.players.p2.legs} ${m.players.p2.name}`;
      const live = m.id === currentMatchId.value;
      const extra = live ? '\n\nKampen er i gang. Den bliver gemt igen som en ny kamp, når næste leg er vundet.' : '';
      if (await showConfirm(`${label}, ${formatDate(m.startedAt)}.${extra}`, { title: 'Slet kamp?', confirmText: 'Slet', danger: true })) {
        if (live) detachCurrentMatch();
        remove(firebaseRef(database, `history/matches/${m.id}`));
      }
    };

    const deleteAll = async () => {
      const n = matches.value.length;
      if (await showConfirm(`Alle ${n} kampe i historikken bliver slettet. Det kan ikke fortrydes.`, { title: 'Slet alle kampe?', confirmText: 'Slet alle', danger: true })) {
        if (currentMatchId.value) detachCurrentMatch();
        remove(firebaseRef(database, 'history/matches'));
      }
    };

    onMounted(() => {
      unsubscribers.push(onValue(firebaseRef(database, 'history/matches'), (snap) => {
        raw.value = snap.val();
        loading.value = false;
      }, () => { loading.value = false; }));
      unsubscribers.push(onValue(firebaseRef(database, 'scores'), (snap) => {
        const d = snap.val() || {};
        currentMatchId.value = d.currentMatchId || null;
        scoreboardNames.value = [d.player1Name || '', d.player2Name || ''];
      }));
    });
    onUnmounted(() => unsubscribers.forEach(u => u()));

    return {
      loading, matches, names, playerA, playerB, h2h, h2hRows, recordCards,
      currentMatchId, backLink, deleteMatch, deleteAll, formatDate, formatNumber, average,
    };
  },
};
</script>

<style scoped>
.history {
  --bg: #0E0F12;
  --surface: #181A20;
  --key: #1E2027;
  --line: #2A2D36;
  --text: #F2F2EE;
  --muted: #9AA0AD;
  --soft: #C5C9D2;
  --accent: #5B95FF;
  --gold: #FFB547;
  --display: 'Barlow Condensed', 'Arial Narrow', sans-serif;

  color: var(--text);
  font-family: 'Barlow', system-ui, sans-serif;
  padding: 16px 16px 40px;
  box-sizing: border-box;
}

.history *,
.history *::before,
.history *::after {
  box-sizing: border-box;
}

button,
select {
  font: inherit;
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

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-title {
  margin: 0;
  font-family: var(--display);
  font-weight: 800;
  font-size: 26px;
  letter-spacing: 0.04em;
}

.spacer {
  flex: 1;
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
}

.icon-link:hover {
  color: var(--text);
  border-color: var(--accent);
}

.block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  margin: 0;
  font-family: var(--display);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.14em;
  color: var(--muted);
}

.empty {
  color: var(--muted);
}

.empty-card {
  background: var(--surface);
  border-radius: 16px;
  padding: 24px 20px;
  text-align: center;
}

.empty-card h2 {
  margin: 0 0 8px;
  font-family: var(--display);
  font-size: 24px;
  text-transform: uppercase;
}

.empty-card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.5;
}

.empty-card.small {
  padding: 16px;
}

.card {
  background: var(--surface);
  border-radius: 16px;
  padding: 18px 16px 8px;
}

/* Head-to-head */
.h2h-pickers {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.picker-field select {
  width: 100%;
  height: 48px;
  padding: 0 36px 0 14px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--key) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%239AA0AD' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 14px center;
  color: var(--text);
  font-family: var(--display);
  font-weight: 700;
  font-size: 18px;
  text-transform: uppercase;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.picker-field select:focus {
  outline: none;
  border-color: var(--accent);
}

.vs {
  font-family: var(--display);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.1em;
  color: var(--muted);
}

.h2h-score {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: end;
  gap: 8px;
  padding-bottom: 14px;
  border-bottom: 1px solid #262932;
}

.h2h-side {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.h2h-side.right {
  align-items: flex-end;
  text-align: right;
}

.h2h-name {
  font-family: var(--display);
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.h2h-big {
  font-family: var(--display);
  font-weight: 800;
  font-size: 72px;
  line-height: 0.9;
}

.h2h-big.lead {
  color: var(--accent);
}

.h2h-mid {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding-bottom: 6px;
}

.h2h-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--muted);
}

.h2h-dash {
  font-family: var(--display);
  font-size: 30px;
  font-weight: 700;
  color: var(--line);
  line-height: 1;
}

.h2h-draws {
  font-size: 12px;
  color: var(--muted);
}

.rows {
  font-variant-numeric: tabular-nums;
}

.row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 8px;
  padding: 11px 0;
  border-bottom: 1px solid #262932;
  font-size: 16px;
  font-weight: 600;
}

.row:last-child {
  border-bottom: 0;
}

.row span:last-child {
  text-align: right;
}

.row .row-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  text-align: center;
}

.row .win {
  color: var(--accent);
}

/* Records */
.records {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.record {
  background: var(--surface);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.record-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--muted);
  text-transform: uppercase;
}

.record-value {
  font-family: var(--display);
  font-weight: 800;
  font-size: 34px;
  line-height: 1;
}

.record-value.gold {
  color: var(--gold);
}

.record-who {
  font-size: 13px;
  color: var(--soft);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Match list */
.matches {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.match {
  background: var(--surface);
  border-radius: 14px;
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.match-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;
}

.match-date {
  font-size: 13px;
  color: var(--muted);
  font-weight: 600;
}

.live-tag {
  font-family: var(--display);
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 0.1em;
  background: var(--accent);
  color: var(--bg);
  border-radius: 999px;
  padding: 3px 8px;
}

.match-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete {
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: transparent;
  color: #FF9B8A;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.delete:hover {
  background: var(--key);
  border-color: #FF9B8A;
}

.delete-all {
  align-self: center;
  margin-top: 8px;
  height: 44px;
  padding: 0 18px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: transparent;
  color: #FF9B8A;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.delete-all:hover {
  background: var(--surface);
  border-color: #FF9B8A;
}

.match-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 10px;
}

.match-player {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  color: var(--soft);
}

.match-player.right {
  align-items: flex-end;
  text-align: right;
}

.match-player.won {
  color: var(--text);
}

.mp-name {
  font-family: var(--display);
  font-weight: 700;
  font-size: 19px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.mp-avg {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  letter-spacing: 0.04em;
}

.match-legs {
  font-family: var(--display);
  font-weight: 800;
  font-size: 30px;
  display: flex;
  gap: 6px;
  align-items: center;
}

.match-legs .lead {
  color: var(--accent);
}

.match-legs .dash {
  color: var(--line);
}

.gold {
  color: var(--gold);
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

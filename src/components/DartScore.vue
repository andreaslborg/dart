<template>
  <div class="dart-score">
    <div class="layout">
      <div class="col-main">
        <header class="topbar">
          <div class="brand">
            <svg class="brand-mark" width="34" height="34" viewBox="0 0 48 48" aria-hidden="true">
              <rect x="0" y="0" width="48" height="48" rx="12" fill="#5B95FF" />
              <path d="M15 10v28M15 10h10a7 7 0 0 1 0 14H15M15 24h12a7 7 0 0 1 0 14H15" fill="none" stroke="#0E0F12" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="25" cy="17" r="2.6" fill="#0E0F12" />
            </svg>
            <span class="brand-word">BORG<span class="accent">DART</span></span>
          </div>
          <div class="pill">{{ startScore }} · LEG {{ legNumber }}</div>
        </header>

        <div v-if="hasWinner" class="winner-banner">{{ scoreboardTitle }}</div>

        <section class="score-display">
          <div class="player-card" :class="{ active: isPlayer1Turn }">
            <div v-if="isPlayer1Turn" class="turn-tag">DIN TUR</div>
            <button class="name" type="button" title="Skift navn" @click="changePlayerName(1)">{{ player1Name }}</button>
            <div class="score">{{ totalScores.player1 }}</div>
            <div class="checkout-row">
              <span v-if="player1Checkout" class="checkout" :class="{ none: player1Checkout === 'No checkout' }">{{ formatCheckout(player1Checkout) }}</span>
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
          </div>

          <div class="player-card" :class="{ active: !isPlayer1Turn }">
            <div v-if="!isPlayer1Turn" class="turn-tag">DIN TUR</div>
            <button class="name" type="button" title="Skift navn" @click="changePlayerName(2)">{{ player2Name }}</button>
            <div class="score">{{ totalScores.player2 }}</div>
            <div class="checkout-row">
              <span v-if="player2Checkout" class="checkout" :class="{ none: player2Checkout === 'No checkout' }">{{ formatCheckout(player2Checkout) }}</span>
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
          <h2 class="section-title">SPIL</h2>
          <div class="segmented">
            <button v-for="p in presetScores" :key="p" type="button" :class="{ selected: p === startScore }" @click="setPredefinedScore(p)">{{ p }}</button>
          </div>
          <div class="actions">
            <button type="button" @click="switchTurns">Skift tur</button>
            <button type="button" @click="undoLastTurn">Fortryd tur</button>
            <button type="button" class="danger" @click="resetWins">Nulstil total</button>
          </div>
        </section>
      </div>

      <section class="col-stats">
        <h2 class="section-title">STATS</h2>
        <div class="stats">
          <div class="stats-row head">
            <span></span>
            <span :class="{ accent: isPlayer1Turn }">{{ player1Name }}</span>
            <span :class="{ accent: !isPlayer1Turn }">{{ player2Name }}</span>
          </div>
          <div class="stats-row"><span>Gns. leg</span><span>{{ fmt(averageScore.player1) }}</span><span>{{ fmt(averageScore.player2) }}</span></div>
          <div class="stats-row"><span>Gns. sæt</span><span>{{ fmt(averageSetScore.player1) }}</span><span>{{ fmt(averageSetScore.player2) }}</span></div>
          <div class="stats-row"><span>Første 9 dart</span><span>{{ fmt(firstNineDartSetScore.player1) }}</span><span>{{ fmt(firstNineDartSetScore.player2) }}</span></div>
          <div class="stats-row"><span>Højeste score</span><span>{{ fmt(highestThreeDartScore.player1) }}</span><span>{{ fmt(highestThreeDartScore.player2) }}</span></div>
          <div class="stats-row"><span>Laveste score</span><span>{{ fmt(lowestThreeDartScore.player1) }}</span><span>{{ fmt(lowestThreeDartScore.player2) }}</span></div>
          <div class="stats-row"><span>Højeste checkout</span><span class="gold">{{ fmt(player1HighestCheckout) }}</span><span class="gold">{{ fmt(player2HighestCheckout) }}</span></div>
          <div class="stats-row"><span>Laveste checkout</span><span>{{ fmt(player1LowestCheckout) }}</span><span>{{ fmt(player2LowestCheckout) }}</span></div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import getDartsCheckout from '@/getDartsCheckout'
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getDatabase, ref as firebaseRef, onValue, update } from 'firebase/database';
import confetti from 'canvas-confetti';
export default {
  setup() {
    const route = useRoute();
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
    const player1HighestCheckout = ref(0);
    const player2HighestCheckout = ref(0);
    const player1LowestCheckout = ref(NaN);
    const player2LowestCheckout = ref(NaN);
    const startScore = ref(501);
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

    const fetchScores = () => {
      onValue(dbRef, (snapshot) => {
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
        }
      });
    };
    
    function updateCurrentScore(num) {
      currentScore.value = `${currentScore.value}${num}`;
    }

    const submitScore = () => {
      const playerNum = route.query.player;
      if (!playerNum || (playerNum !== '1' && playerNum !== '2')) {
        alert("Invalid player number!");
        return;
      }

      if ((playerNum === '1' && !isPlayer1Turn.value) || (playerNum === '2' && isPlayer1Turn.value)) {
        alert("Ikke din tur klovn!");
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
        return;
      }

      if (scoreInput > 180) {
        alert("Duuude din score kan ikke være højere end 180.");
        currentScore.value = '';
        return;
      }

      const playerKey = `player${playerNum}`;
      let newScore = totalScores.value[playerKey] - scoreInput;

      if (newScore < 0) {
        alert("Kan ikke være under 0...");
        currentScore.value = '';
        return;
      } else if (newScore === 0) {
        const winAnnouncement = `${playerNum === '1' ? player1Name.value : player2Name.value} vandt!`;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        const winnerKey = playerKey === 'player1' ? 'player1Wins' : 'player2Wins';
        const updatedWins = (winnerKey === 'player1Wins' ? player1Wins.value : player2Wins.value) + 1;

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
        update(dbRef, { [playerKey]: newScore, [winnerKey]: updatedWins, scoreboardTitle: winAnnouncement });

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

        // Update isPlayer1Turn after submitting the score
        update(dbRef, { isPlayer1Turn: !isPlayer1Turn.value });
      }
    };

    const setPredefinedScore = (score) => {
      if (window.confirm(`Nulstil score til ${score}. Er du sikker?`)) {
        update(dbRef, { 
          player1Checkout: "", 
          player2Checkout: "", 
          isPlayer1Turn: true, 
          player1: score,
          player2: score,
          startScore: score,
          player1Scores: [],
          player2Scores: [], 
          scoreboardTitle: 'Borg Dart' 
        });
      }
    };

    const switchTurns = () => {
      // Toggle isPlayer1Turn and update it in the database
      update(dbRef, { isPlayer1Turn: !isPlayer1Turn.value });
    };

    const resetWins = () => {
      if (window.confirm(`Er du sikker på at du vil nulstille total score?`)) {
        update(dbRef, { 
          player1Wins: 0,  
          player2Wins: 0,
          player1Checkout: "", 
          player2Checkout: "", 
          isPlayer1Turn: true, 
          lastTurnScorePlayer1: 0, 
          lastTurnScorePlayer2: 0,
          secondTurnScorePlayer1: "", 
          secondTurnScorePlayer2: "",
          thirdTurnScorePlayer1: "", 
          thirdTurnScorePlayer2: "",   
          player1: 501,
          player2: 501,
          startScore: 501,
          player1Scores: [],
          player2Scores: [],
          player1SetScores: [], 
          player2SetScores: [],
          player1HighestCheckout: null,
          player2HighestCheckout: null,
          player1LowestCheckout: null,
          player2LowestCheckout: null,
          scoreboardTitle: 'Borg Dart' 
        });
      }
    };

    const undoLastTurn = () => {
      const playerNum = isPlayer1Turn.value ? '2' : '1'; // If it's now player 1's turn, it means the last turn was player 2's, and vice versa
      const playerKey = `player${playerNum}`;
      const lastTurnScoreKey = `lastTurnScorePlayer${playerNum}`;
      const lastTurnScore = playerNum === '1' ? lastTurnScorePlayer1.value : lastTurnScorePlayer2.value;
      if (window.confirm(`Fortryd ${lastTurnScore} point. Er du sikker?`)) {        
        /*if (lastTurnScore === 0) {
          alert("Ingen tidligere score at fortryde.");
          return;
        }*/
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
            update(dbRef, { player1Scores: player1Scores.value });
          } else {
            totalScores.value.player2 += lastTurnScore;
            lastTurnScorePlayer2.value = 0;
            player2Scores.value.pop();
            player2SetScores.value.pop();
            update(dbRef, { player2Scores: player2Scores.value });
          }
          // Optionally switch turns back
          isPlayer1Turn.value = !isPlayer1Turn.value;
          update(dbRef, { isPlayer1Turn: isPlayer1Turn.value });
        }).catch(error => {
          console.error("Error undoing last turn:", error);
        });
      }
    };

    const changePlayerName = (playerNumber) => {
      const newName = prompt(`Indtast nyt navn for Spiller ${playerNumber}:`);
      if (newName && newName.trim() !== '') {
        const playerNameKey = `player${playerNumber}Name`;
        update(dbRef, { [playerNameKey]: newName.trim() });
      }
    };

    function deleteLastNum() {
      if (currentScore.value.length > 0) {
        currentScore.value = currentScore.value.slice(0, -1);
      }
    }

    onMounted(fetchScores);

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
      recentScores
    };
  }
};
</script>

<style scoped>
.dart-score {
  --bg: #0E0F12;
  --surface: #181A20;
  --key: #1E2027;
  --key-hover: #272A33;
  --line: #2A2D36;
  --text: #F2F2EE;
  --muted: #9AA0AD;
  --soft: #C5C9D2;
  --accent: #5B95FF;
  --gold: #FFB547;
  --danger: #FF9B8A;
  --display: 'Barlow Condensed', 'Arial Narrow', sans-serif;

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

.winner-banner {
  background: var(--accent);
  color: var(--bg);
  font-family: var(--display);
  font-weight: 800;
  font-size: 24px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-align: center;
  border-radius: 12px;
  padding: 10px 12px;
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
  color: var(--bg);
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
  font-size: 76px;
  line-height: 0.9;
  font-variant-numeric: tabular-nums;
}

.checkout-row {
  min-height: 22px;
  display: flex;
}

.checkout {
  font-family: var(--display);
  font-weight: 700;
  font-size: 15px;
  color: var(--bg);
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
  color: #3A3E49;
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
  background: #23262E;
  display: flex;
  align-items: center;
  justify-content: center;
}

.key.enter {
  grid-column: span 2;
  background: var(--accent);
  color: var(--bg);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.key.enter:hover {
  background: #7AAAFF;
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
  color: var(--bg);
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
  border-bottom: 1px solid #262932;
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
  color: var(--gold);
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

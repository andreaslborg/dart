<template>
  <div class="dart-score">
    <h1 class="scoreboard-title">{{ scoreboardTitle }}</h1> <!-- Display scoreboard title -->
    <div class="score-display">
      <div class="player">
        <h2 class="name" @click="changePlayerName(1)">{{ player1Name }}</h2><!-- Dynamic name for player 1 -->
        <p class="checkout-option">{{ player1Checkout }}</p>
        <div class="score-container">
          <p class="temp-score left">{{ lastTurnScorePlayer1 }}</p>
          <p class="temp-score2 left">{{ secondTurnScorePlayer1 }}</p>
          <p class="temp-score3 left">{{ thirdTurnScorePlayer1 }}</p>
          <p class="score">{{ totalScores.player1 }}</p>
        </div>
        <p class="average-score">AVG {{ averageScore.player1 }}</p>        
        <p class="your-turn">{{ isPlayer1Turn ? 'DIN TUR' : '' }}</p>
      </div>
      <div>
        <p class="total-wins">
          {{ player1Wins }}
          -
          {{ player2Wins }}
        </p>
      </div>
      <div class="player">
        <h2 class="name" @click="changePlayerName(2)">{{ player2Name }}</h2> <!-- Dynamic name for player 2 -->
        <p class="checkout-option">{{ player2Checkout }}</p>
        <div class="score-container">
          <p class="score">{{ totalScores.player2 }}</p>
          <p class="temp-score right">{{ lastTurnScorePlayer2 }}</p>
          <p class="temp-score2 right">{{ secondTurnScorePlayer2 }}</p>
          <p class="temp-score3 right">{{ thirdTurnScorePlayer2 }}</p>
        </div>
        <p class="average-score">AVG {{ averageScore.player2 }}</p>
        <p class="your-turn">{{ !isPlayer1Turn ? 'DIN TUR' : '' }}</p>
      </div>
    </div>
    <div class="input">
      <input type="number"
           v-model="currentScore"
           placeholder="Score"
           id="scoreInput"
           autofocus
           @keyup.enter="submitScore">
           <a class="button delete" @click="deleteLastNum">SLET</a>
    </div>
    <div class="numlock-style">
      <a class="button" v-for="num in [7,8,9,4,5,6,1,2,3]" :key="num" @click="updateCurrentScore(num)" :disabled="!isPlayer1Turn">
        {{ num }}
      </a>
      <a class="button double" @click="updateCurrentScore(0)" :disabled="!isPlayer1Turn">0</a>
      <a class="button submit" @click="submitScore">ENTER</a>
    </div>
    <!-- Predefined Score Buttons -->
    <h2 class="config-name">INDSTILLINGER</h2>
    <div class="preset-scores">
        <a class="button" @click="setPredefinedScore(201)" :disabled="!isPlayer1Turn">201</a>
        <a class="button" @click="setPredefinedScore(301)" :disabled="!isPlayer1Turn">301</a>
        <a class="button" @click="setPredefinedScore(501)" :disabled="!isPlayer1Turn">501</a>
        <a class="button" @click="setPredefinedScore(701)" :disabled="!isPlayer1Turn">701</a>
        <a class="button" @click="setPredefinedScore(1000)" :disabled="!isPlayer1Turn">1000</a>
        <a class="button switch-turns" @click="switchTurns">Skift tur</a>
        <a class="button switch-turns" @click="undoLastTurn">Fortryd tur</a>
        <a class="button switch-turns" @click="resetWins">Nulstil total</a>
    </div>

    <!-- Stats Table -->
    <h2 class="stats-title">Stats</h2>
    <table class="stats-table">
      <colgroup>
        <col style="width: 50%;">
        <col style="width: 25%;">
        <col style="width: 25%;">
      </colgroup>
      <thead>
        <tr>
          <th>STAT</th>
          <th>{{ player1Name }}</th>
          <th>{{ player2Name }}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>AVERAGE<br>LEG SCORE</td>
          <td class="boldtext">{{ averageScore.player1 }}</td>
          <td>{{ averageScore.player2 }}</td>
        </tr>
        <tr>
          <td>AVERAGE<br>SET SCORE</td>
          <td>{{ averageSetScore.player1 }}</td>
          <td>{{ averageSetScore.player2 }}</td>
        </tr>
        <tr>
          <td>HIGHEST<br>SCORE</td>
          <td>{{ highestThreeDartScore.player1 }}</td>
          <td>{{ highestThreeDartScore.player2 }}</td>
        </tr>
        <tr>
          <td>LOWEST<br>SCORE</td>
          <td>{{ lowestThreeDartScore.player1 }}</td>
          <td>{{ lowestThreeDartScore.player2 }}</td>
        </tr>
        <tr>
          <td>HIGHEST<br>CHECKOUT</td>
          <td>{{ player1HighestCheckout }}</td>
          <td>{{ player2HighestCheckout }}</td>
        </tr>
        <tr>
          <td>LOWEST<br>CHECKOUT</td>
          <td>{{ player1LowestCheckout }}</td>
          <td>{{ player2LowestCheckout }}</td>
        </tr>
      </tbody>
    </table>
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
        if (lastTurnScore === 0) {
          alert("Ingen tidligere score at fortryde.");
          return;
        }
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
      highestThreeDartScore,
      lowestThreeDartScore
    };
  }
};
</script>

<style scoped>
.scoreboard-title {
  color: #f0f0f0;
  font-size: 28px;
  text-transform: uppercase;
  margin: 0;
}

.dart-score {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media screen and (min-width: 992px) {
  .stats-title {
    display: none;
  }
  .stats-table {
    position: absolute;
    top: 250px;
    right: 20%;
  }

  .preset-scores {
    margin-bottom: 30px;
  }
}

.score-display {
  display: flex;
  justify-content: center;
  gap: 0px;
  width: 100%;
}

.player {
  text-align: center;
  color: #f0f0f0;
  width: 130px;
}

.player .name {
  font-size: 28px;
  margin-top: 15px;
  margin-bottom: 0;
}

.player .score {
  font-size: 35px;
  margin-top: 0px;
  margin-bottom: 0;
  font-weight: 900;
  text-decoration: none;
}

.player .checkout-option {
  font-size: 14px;
  margin: 0;
  font-weight: 900;
  height: 20px;
  color: #aaaaaa;
}

.player .average-score {
  font-size: 12px;
  font-weight: 900;
  margin: -5px 0px 5px 0px;
  color: #aaaaaa;
}

.score-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.temp-score {
  margin: 0;
  color: grey;
}

.temp-score2 {
  margin: 50px 0 0 0;
  color: rgba(128, 128, 128, 0.5);
}

.temp-score3 {
  margin: 100px 0 0 0;
  color: rgba(128, 128, 128, 0.25);
}

.temp-score.right, .temp-score2.right, .temp-score3.right {
  font-size: 20px;
  font-weight: 900;
  margin-left: 130px;
  text-decoration: none;
  position: absolute;
}

.temp-score.left, .temp-score2.left, .temp-score3.left {
  font-size: 20px;
  font-weight: 900;
  margin-right: 130px;
  text-decoration: none;
  position: absolute;
}


.player .your-turn {
  font-size: 16px;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 10px;
  padding: 0;
}

.total-wins {
  margin: 75px 0 0 0;
  padding: 0;
  font-weight: 900;
  font-size: 20px;
  color: #f0f0f0;
}

#scoreInput {
  margin-bottom: 10px;
  font-size: 30px;
  font-weight: 700;
  color: #f0f0f0;
  background: 0;
  text-align: center;
  border: 0;
  text-transform: uppercase;
  grid-column: span 2;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
}

#scoreInput::placeholder {
   color: rgba(255, 255, 255, 0.3)
}

.input {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 300px;
  padding-top: 8px;
  padding-bottom: 8px;
}

.numlock-style {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Creates a 3-column grid */
  gap: 8px; /* Adjust gap as needed */
  width: 300px;
}

.button {
  padding: 20px 10px;
  font-size: 20px;
  display: inline-block; /* Or 'block' depending on your layout needs */
  text-align: center;
  text-decoration: none; /* Removes underline from links */
  cursor: pointer; /* Ensures the cursor changes to a pointer */
  border: 1px solid transparent; /* Optional: for styling purposes */
  border-radius: 4px; /* Optional: for rounded corners */
  background-color: #f0f0f0; /* Optional: background color */
  color: #000; /* Text color */
}

.delete {
  display: flex;
  padding: 0;
  justify-content: center;
  align-items: center;
  font-size: 18px;
}

/* Hover effect */
.button:hover {
  background-color: #e0e0e0; /* Darker shade on hover */
  border-color: #d0d0d0; /* Optional: change border color on hover */
}

.preset-scores {
  display: grid;
  grid-template-columns: repeat(4, 1fr); 
  justify-content: center;
  gap: 8px;
  width: 300px;
}

.config-name {
  color: #f0f0f0;
  margin-top: 20px;
  margin-bottom: 10px;
}

.preset-scores .switch-turns {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 0px;
  font-size: 15px;
  font-style: italic;
}

.preset-scores .button {
  padding: 10px 0;
  height: 25px;
  width: 68px;
}

.double {
  grid-column: span 2; /* Makes the element span two columns */
}

.submit {
  text-transform: uppercase;
  font-weight: 700;
}

.stats-title {
  color: #f0f0f0;
  font-size: 24px;
  text-transform: uppercase;
  margin: 20px 0 0 0;
  overflow: hidden;
}

.stats-table {
  width: 300px;
  margin-top: 10px;
  margin-bottom: 30px;
  border: 1px solid white;
  border-radius: 4px;
  border-spacing: 0;
  border-collapse: separate;
}

.stats-table th {
  color: #f0f0f0;
  font-size: 16px;
  font-weight: 800;
  padding: 8px;
  border: 1px solid white;
}

.stats-table td {
  color: #f0f0f0;
  font-size: 14px;
  font-weight: 800;
  padding: 2px;
  border: 1px solid white;
}

.stats-table td {
  text-align: center;
  color: #f0f0f0;
}

.stats-table colgroup col:first-child {
  width: 50%;
}

.stats-table colgroup col:nth-child(2),
.stats-table colgroup col:nth-child(3) {
  width: 25%;
}

</style>

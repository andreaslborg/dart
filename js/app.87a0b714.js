(function(){"use strict";var e={6481:function(e,r,a){var t=a(5130),n=a(6768);const s={id:"app"};function u(e,r,a,t,u,c){const o=(0,n.g2)("router-view");return(0,n.uX)(),(0,n.CE)("div",s,[(0,n.bF)(o)])}var c={name:"App",components:{}},o=a(1241);const l=(0,o.A)(c,[["render",u]]);var i=l,T=a(1387),D=a(4232);const d=e=>((0,n.Qi)("data-v-0aae785e"),e=e(),(0,n.jt)(),e),p={class:"dart-score"},y={class:"scoreboard-title"},v={class:"score-display"},k={class:"player"},f={class:"checkout-option"},b={class:"score-container"},h={class:"temp-score left"},m={class:"score"},L={class:"your-turn"},P={class:"total-wins"},S={class:"player"},C={class:"checkout-option"},N={class:"score-container"},g={class:"score"},w={class:"temp-score right"},_={class:"your-turn"},B={class:"input"},R={class:"numlock-style"},K=["onClick","disabled"],I=["disabled"],W=d((()=>(0,n.Lk)("h2",{class:"config-name"},"Indstillinger",-1))),E={class:"preset-scores"},O=["disabled"],j=["disabled"],$=["disabled"],A=["disabled"],q=["disabled"];function x(e,r,a,s,u,c){return(0,n.uX)(),(0,n.CE)("div",p,[(0,n.Lk)("h1",y,(0,D.v_)(s.scoreboardTitle),1),(0,n.Lk)("div",v,[(0,n.Lk)("div",k,[(0,n.Lk)("h2",{class:"name",onClick:r[0]||(r[0]=e=>s.changePlayerName(1))},(0,D.v_)(s.player1Name),1),(0,n.Lk)("p",f,(0,D.v_)(s.player1Checkout),1),(0,n.Lk)("div",b,[(0,n.Lk)("p",h,(0,D.v_)(s.lastTurnScorePlayer1),1),(0,n.Lk)("p",m,(0,D.v_)(s.totalScores.player1),1)]),(0,n.Lk)("p",L,(0,D.v_)(s.isPlayer1Turn?"DIN TUR":""),1)]),(0,n.Lk)("div",null,[(0,n.Lk)("p",P,(0,D.v_)(s.player1Wins)+" - "+(0,D.v_)(s.player2Wins),1)]),(0,n.Lk)("div",S,[(0,n.Lk)("h2",{class:"name",onClick:r[1]||(r[1]=e=>s.changePlayerName(2))},(0,D.v_)(s.player2Name),1),(0,n.Lk)("p",C,(0,D.v_)(s.player2Checkout),1),(0,n.Lk)("div",N,[(0,n.Lk)("p",g,(0,D.v_)(s.totalScores.player2),1),(0,n.Lk)("p",w,(0,D.v_)(s.lastTurnScorePlayer2),1)]),(0,n.Lk)("p",_,(0,D.v_)(s.isPlayer1Turn?"":"DIN TUR"),1)])]),(0,n.Lk)("div",B,[(0,n.bo)((0,n.Lk)("input",{type:"number","onUpdate:modelValue":r[2]||(r[2]=e=>s.currentScore=e),placeholder:"Score",id:"scoreInput",autofocus:"",onKeyup:r[3]||(r[3]=(0,t.jR)(((...e)=>s.submitScore&&s.submitScore(...e)),["enter"]))},null,544),[[t.Jo,s.currentScore]]),(0,n.Lk)("a",{class:"button delete",onClick:r[4]||(r[4]=(...e)=>s.deleteLastNum&&s.deleteLastNum(...e))},"SLET")]),(0,n.Lk)("div",R,[((0,n.uX)(),(0,n.CE)(n.FK,null,(0,n.pI)([7,8,9,4,5,6,1,2,3],(e=>(0,n.Lk)("a",{class:"button",key:e,onClick:r=>s.updateCurrentScore(e),disabled:!s.isPlayer1Turn},(0,D.v_)(e),9,K))),64)),(0,n.Lk)("a",{class:"button double",onClick:r[5]||(r[5]=e=>s.updateCurrentScore(0)),disabled:!s.isPlayer1Turn},"0",8,I),(0,n.Lk)("a",{class:"button submit",onClick:r[6]||(r[6]=(...e)=>s.submitScore&&s.submitScore(...e))},"ENTER")]),W,(0,n.Lk)("div",E,[(0,n.Lk)("a",{class:"button",onClick:r[7]||(r[7]=e=>s.setPredefinedScore(201)),disabled:!s.isPlayer1Turn},"201",8,O),(0,n.Lk)("a",{class:"button",onClick:r[8]||(r[8]=e=>s.setPredefinedScore(301)),disabled:!s.isPlayer1Turn},"301",8,j),(0,n.Lk)("a",{class:"button",onClick:r[9]||(r[9]=e=>s.setPredefinedScore(501)),disabled:!s.isPlayer1Turn},"501",8,$),(0,n.Lk)("a",{class:"button",onClick:r[10]||(r[10]=e=>s.setPredefinedScore(701)),disabled:!s.isPlayer1Turn},"701",8,A),(0,n.Lk)("a",{class:"button",onClick:r[11]||(r[11]=e=>s.setPredefinedScore(1e3)),disabled:!s.isPlayer1Turn},"1000",8,q),(0,n.Lk)("a",{class:"button switch-turns",onClick:r[12]||(r[12]=(...e)=>s.switchTurns&&s.switchTurns(...e))},"Skift tur"),(0,n.Lk)("a",{class:"button switch-turns",onClick:r[13]||(r[13]=(...e)=>s.undoLastTurn&&s.undoLastTurn(...e))},"Fortryd tur"),(0,n.Lk)("a",{class:"button switch-turns",onClick:r[14]||(r[14]=(...e)=>s.resetWins&&s.resetWins(...e))},"Nulstil total")])])}function F(e){switch(e){case 170:return"T20, T20, B50";case 169:return"No checkout";case 168:return"No checkout";case 167:return"T20, T19, B50";case 166:return"No checkout";case 165:return"No checkout";case 164:return"T20, T18, B50";case 163:return"No checkout";case 162:return"No checkout";case 161:return"T20, T17, B50";case 160:return"T20, T20, D20";case 159:return"No checkout";case 158:return"T20, T20, D19";case 157:return"T20, T19, D20";case 156:return"T20, T20, D18";case 155:return"T20, T19, D19";case 154:return"T20, T18, D20";case 153:return"T20, T19, D18";case 152:return"T20, T20, D16";case 151:return"T20, T17, D20";case 150:return"T20, T18, D18";case 149:return"T20, T19, D16";case 148:return"T20, T20, D14";case 147:return"T20, T17, D18";case 146:return"T20, T18, D16";case 145:return"T20, T15, D20";case 144:return"T20, T20, D12";case 143:return"T20, T17, D16";case 142:return"T20, T14, D20";case 141:return"T20, T15, D18";case 140:return"T20, T16, D16";case 139:return"T19, T14, D20";case 138:return"T20, T18, D12";case 137:return"T20, T19, D10";case 136:return"T20, T20, D8";case 135:return"B25, T20, B50";case 134:return"T20, T14, D16";case 133:return"T20, T19, D8";case 132:return"B25, T19, B50";case 131:return"T20, T13, D16";case 130:return"T20, T20, D5";case 129:return"T19, T16, D12";case 128:return"T18, T14, D16";case 127:return"T20, T17, D8";case 126:return"T19, 19, B50";case 125:return"B50, T20, D20";case 124:return"T20, T16, D8";case 123:return"T19, T16, D9";case 122:return"T18, T18, D7";case 121:return"T20, T11, D14";case 120:return"T20, 20, D20";case 119:return"T20, 19, B50";case 118:return"T20, 18, D20";case 117:return"T20, 17, D20";case 116:return"T20, 16, D20";case 115:return"T20, 15, D20";case 114:return"T20, 14, D20";case 113:return"T20, 13, D20";case 112:return"T20, 12, D20";case 111:return"T20, 11, D20";case 110:return"T20, 10, D20";case 109:return"T20, 9, D20";case 108:return"T20, 16, D16";case 107:return"T19, 10, D20";case 106:return"T20, 6, D20";case 105:return"T20, 5, D20";case 104:return"T18, 18, D16";case 103:return"T20, 3, D20";case 102:return"T20, 10, D16";case 101:return"T17, 10, D20";case 100:return"T20, D20";case 99:return"T19, 10, D16";case 98:return"T20, D19";case 97:return"T19, D20";case 96:return"T20, D18";case 95:return"T19, D19";case 94:return"T18, D20";case 93:return"T19, D18";case 92:return"T20, D16";case 91:return"T17, D20";case 90:return"T20, D15";case 89:return"T19, D16";case 88:return"T20, D14";case 87:return"T17, D18";case 86:return"T18, D16";case 85:return"T15, D20";case 84:return"T20, D12";case 83:return"T17, D16";case 82:return"B50, D16";case 81:return"T19, D12";case 80:return"T20, D10";case 79:return"T13, D20";case 78:return"T18, D12";case 77:return"T19, D10";case 76:return"T20, D8";case 75:return"T17, D12";case 74:return"T14, D16";case 73:return"T19, D8";case 72:return"T16, D12";case 71:return"T13, D16";case 70:return"T18, D8";case 69:return"T19, D6";case 68:return"T20, D4";case 67:return"T17, D8";case 66:return"T10, D18";case 65:return"T19, D4";case 64:return"T16, D8";case 63:return"T13, D12";case 62:return"T10, D16";case 61:return"T15, D8";case 60:return"20, D20";case 59:return"19, D20";case 58:return"18, D20";case 57:return"17, D20";case 56:return"16, D20";case 55:return"15, D20";case 54:return"14, D20";case 53:return"13, D20";case 52:return"12, D20";case 51:return"11, D20";case 50:return"10, D20 or B50";case 49:return"9, D20";case 48:return"16, D16";case 47:return"15, D16";case 46:return"14, D16";case 45:return"13, D16";case 44:return"12, D16";case 43:return"11, D16";case 42:return"10, D16";case 41:return"9, D16";case 40:return"D20";case 39:return"7, D16";case 38:return"D19";case 37:return"5, D16";case 36:return"D18";case 35:return"3, D16";case 34:return"D17";case 33:return"1, D16";case 32:return"D16";case 31:return"15, D8";case 30:return"D15";case 29:return"13, D8";case 28:return"D14";case 27:return"11, D8";case 26:return"D13";case 25:return"9, D8";case 24:return"D12";case 23:return"7, D8";case 22:return"D11";case 21:return"5, D8";case 20:return"D10";case 19:return"3, D8";case 18:return"D9";case 17:return"1, D8";case 16:return"D8";case 15:return"7, D4";case 14:return"D7";case 13:return"5, D4";case 12:return"D6";case 11:return"3, D4";case 10:return"D5";case 9:return"1, D4";case 8:return"D4";case 7:return"3, D2";case 6:return"D3";case 5:return"1, D2";case 4:return"D2";case 3:return"1, D1";case 2:return"D1";default:return""}}var U=F,J=a(144),V=a(4161),X=a(8446),z={setup(){const e=(0,T.lq)(),r=(0,V.C3)(),a=(0,V.KR)(r,"scores"),t=(0,J.KR)({player1:501,player2:501}),s=(0,J.KR)(""),u=(0,J.KR)(!1),c=(0,J.KR)("Borg Dart"),o=(0,J.KR)("Player 1"),l=(0,J.KR)("Player 2"),i=(0,J.KR)(0),D=(0,J.KR)(0),d=(0,J.KR)(0),p=(0,J.KR)(0),y=(0,J.KR)(""),v=(0,J.KR)(""),k=()=>{(0,V.Zy)(a,(e=>{const r=e.val();r&&(t.value=r,u.value=r.isPlayer1Turn,c.value=r.scoreboardTitle||"Borg Dart",o.value=r.player1Name||"Player 1",l.value=r.player2Name||"Player 2",i.value=r.player1Wins||0,D.value=r.player2Wins||0,d.value=r.lastTurnScorePlayer1||0,p.value=r.lastTurnScorePlayer2||0,y.value=r.player1Checkout||"",v.value=r.player2Checkout||"")}))};function f(e){s.value=`${s.value}${e}`}const b=()=>{if("1"===e.query.player&&!u.value||"2"===e.query.player&&u.value)return void alert("Ikke din tur klovn!");const r=parseInt(s.value);if(isNaN(r))return s.value="",void(0,V.yo)(a,{isPlayer1Turn:!u.value});if(r>180)return alert("Duuude din score kan ikke være højere end 180."),void(s.value="");const n=`player${e.query.player}`;let c=t.value[n]-r;if(c<0)return alert("Kan ikke være under 0..."),void(s.value="");if(0===c){const r=`${"1"===e.query.player?o.value:l.value} vandt!`;(0,X.A)({particleCount:100,spread:70,origin:{y:.6}});const t="player1"===n?"player1Wins":"player2Wins",u=("player1Wins"===t?i.value:D.value)+1;(0,V.yo)(a,{[n]:c,[t]:u}),(0,V.yo)(a,{scoreboardTitle:r}),s.value=""}else{const t=`lastTurnScorePlayer${e.query.player}`;if((0,V.yo)(a,{[t]:r}),(0,V.yo)(a,{[n]:c}),s.value="",c<=170){const e=U(c),r="player1"===n?"player1Checkout":"player2Checkout";(0,V.yo)(a,{[r]:e})}(0,V.yo)(a,{isPlayer1Turn:!u.value})}},h=e=>{window.confirm(`Nulstil score til ${e}. Er du sikker?`)&&((0,V.yo)(a,{player1Checkout:""}),(0,V.yo)(a,{player2Checkout:""}),(0,V.yo)(a,{isPlayer1Turn:!0}),(0,V.yo)(a,{lastTurnScorePlayer1:0,lastTurnScorePlayer2:0}),(0,V.yo)(a,{player1:e,player2:e}),(0,V.yo)(a,{scoreboardTitle:"Borg Dart"}))},m=()=>{(0,V.yo)(a,{isPlayer1Turn:!u.value})},L=()=>{window.confirm("Er du sikker på at du vil nulstille total score?")&&(0,V.yo)(a,{player1Wins:0,player2Wins:0})},P=()=>{const e=u.value?"2":"1",r=`player${e}`,n=`lastTurnScorePlayer${e}`,s="1"===e?d.value:p.value;if(window.confirm(`Fortryd ${s} point. Er du sikker?`)){if(0===s)return void alert("Ingen tidligere score at fortryde.");(0,V.yo)(a,{[r]:t.value[r]+s,[n]:0}).then((()=>{"1"===e?(t.value.player1+=s,d.value=0):(t.value.player2+=s,p.value=0),u.value=!u.value,(0,V.yo)(a,{isPlayer1Turn:u.value})})).catch((e=>{console.error("Error undoing last turn:",e)}))}},S=e=>{const r=prompt(`Indtast nyt navn for Spiller ${e}:`);if(r&&""!==r.trim()){const t=`player${e}Name`;(0,V.yo)(a,{[t]:r.trim()})}};function C(){s.value.length>0&&(s.value=s.value.slice(0,-1))}return(0,n.sV)(k),{totalScores:t,currentScore:s,submitScore:b,setPredefinedScore:h,updateCurrentScore:f,isPlayer1Turn:u,scoreboardTitle:c,switchTurns:m,changePlayerName:S,player1Name:o,player2Name:l,deleteLastNum:C,player1Wins:i,player2Wins:D,resetWins:L,lastTurnScorePlayer1:d,lastTurnScorePlayer2:p,undoLastTurn:P,player1Checkout:y,player2Checkout:v}}};const Q=(0,o.A)(z,[["render",x],["__scopeId","data-v-0aae785e"]]);var G=Q;const M=[{path:"/",redirect:"/score?player=1"},{path:"/score",name:"Score",component:G}],Z=(0,T.aE)({history:(0,T.LA)("/"),routes:M});var H=Z,Y=a(6400);const ee={apiKey:"AIzaSyA0jBJcDcmDmSzaoxDLbAoIrs4SqJQOGVI",authDomain:"dart-70ff4.firebaseapp.com",databaseURL:"https://dart-70ff4-default-rtdb.europe-west1.firebasedatabase.app",projectId:"dart-70ff4",storageBucket:"dart-70ff4.appspot.com",messagingSenderId:"769498204464",appId:"1:769498204464:web:c8c9ebefd1590787a4e0f5"};(0,Y.Wp)(ee),(0,t.Ef)(i).use(H).mount("#app")}},r={};function a(t){var n=r[t];if(void 0!==n)return n.exports;var s=r[t]={exports:{}};return e[t].call(s.exports,s,s.exports,a),s.exports}a.m=e,function(){var e=[];a.O=function(r,t,n,s){if(!t){var u=1/0;for(i=0;i<e.length;i++){t=e[i][0],n=e[i][1],s=e[i][2];for(var c=!0,o=0;o<t.length;o++)(!1&s||u>=s)&&Object.keys(a.O).every((function(e){return a.O[e](t[o])}))?t.splice(o--,1):(c=!1,s<u&&(u=s));if(c){e.splice(i--,1);var l=n();void 0!==l&&(r=l)}}return r}s=s||0;for(var i=e.length;i>0&&e[i-1][2]>s;i--)e[i]=e[i-1];e[i]=[t,n,s]}}(),function(){a.n=function(e){var r=e&&e.__esModule?function(){return e["default"]}:function(){return e};return a.d(r,{a:r}),r}}(),function(){a.d=function(e,r){for(var t in r)a.o(r,t)&&!a.o(e,t)&&Object.defineProperty(e,t,{enumerable:!0,get:r[t]})}}(),function(){a.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){a.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)}}(),function(){var e={524:0};a.O.j=function(r){return 0===e[r]};var r=function(r,t){var n,s,u=t[0],c=t[1],o=t[2],l=0;if(u.some((function(r){return 0!==e[r]}))){for(n in c)a.o(c,n)&&(a.m[n]=c[n]);if(o)var i=o(a)}for(r&&r(t);l<u.length;l++)s=u[l],a.o(e,s)&&e[s]&&e[s][0](),e[s]=0;return a.O(i)},t=self["webpackChunkdart_score_app"]=self["webpackChunkdart_score_app"]||[];t.forEach(r.bind(null,0)),t.push=r.bind(null,t.push.bind(t))}();var t=a.O(void 0,[504],(function(){return a(6481)}));t=a.O(t)})();
//# sourceMappingURL=app.87a0b714.js.map
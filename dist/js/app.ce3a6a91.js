(function(){"use strict";var e={8688:function(e,r,a){var t=a(5130),u=a(6768);const l={id:"app"};function s(e,r,a,t,s,n){const c=(0,u.g2)("router-view");return(0,u.uX)(),(0,u.CE)("div",l,[(0,u.bF)(c)])}var n={name:"App",components:{}},c=a(1241);const o=(0,c.A)(n,[["render",s]]);var i=o,p=a(1387),v=a(4232);const T=e=>((0,u.Qi)("data-v-452fd2ec"),e=e(),(0,u.jt)(),e),y={class:"dart-score"},d={class:"scoreboard-title"},D={class:"score-display"},h={class:"player"},k={class:"checkout-option"},S={class:"score-container"},f={class:"temp-score left"},L={class:"temp-score2 left"},g={class:"temp-score3 left"},b={class:"score"},m={class:"average-score"},C={class:"your-turn"},P={class:"total-wins"},_={class:"player"},E={class:"checkout-option"},W={class:"score-container"},w={class:"score"},N={class:"temp-score right"},R={class:"temp-score2 right"},K={class:"temp-score3 right"},I={class:"average-score"},B={class:"your-turn"},O={class:"input"},A={class:"numlock-style"},H=["onClick","disabled"],j=["disabled"],x=T((()=>(0,u.Lk)("h2",{class:"config-name"},"INDSTILLINGER",-1))),$={class:"preset-scores"},G=["disabled"],V=["disabled"],F=["disabled"],M=["disabled"],U=["disabled"],q=T((()=>(0,u.Lk)("h2",{class:"stats-title"},"Stats",-1))),J={class:"stats-table"},X=T((()=>(0,u.Lk)("colgroup",null,[(0,u.Lk)("col",{style:{width:"50%"}}),(0,u.Lk)("col",{style:{width:"25%"}}),(0,u.Lk)("col",{style:{width:"25%"}})],-1))),z=T((()=>(0,u.Lk)("th",null,"STAT",-1))),Q=T((()=>(0,u.Lk)("td",null,[(0,u.eW)("AVERAGE"),(0,u.Lk)("br"),(0,u.eW)("LEG SCORE")],-1))),Z={class:"boldtext"},Y=T((()=>(0,u.Lk)("td",null,[(0,u.eW)("AVERAGE"),(0,u.Lk)("br"),(0,u.eW)("SET SCORE")],-1))),ee=T((()=>(0,u.Lk)("td",null,[(0,u.eW)("HIGHEST"),(0,u.Lk)("br"),(0,u.eW)("SCORE")],-1))),re=T((()=>(0,u.Lk)("td",null,[(0,u.eW)("LOWEST"),(0,u.Lk)("br"),(0,u.eW)("SCORE")],-1))),ae=T((()=>(0,u.Lk)("td",null,[(0,u.eW)("HIGHEST"),(0,u.Lk)("br"),(0,u.eW)("CHECKOUT")],-1)));function te(e,r,a,l,s,n){return(0,u.uX)(),(0,u.CE)("div",y,[(0,u.Lk)("h1",d,(0,v.v_)(l.scoreboardTitle),1),(0,u.Lk)("div",D,[(0,u.Lk)("div",h,[(0,u.Lk)("h2",{class:"name",onClick:r[0]||(r[0]=e=>l.changePlayerName(1))},(0,v.v_)(l.player1Name),1),(0,u.Lk)("p",k,(0,v.v_)(l.player1Checkout),1),(0,u.Lk)("div",S,[(0,u.Lk)("p",f,(0,v.v_)(l.lastTurnScorePlayer1),1),(0,u.Lk)("p",L,(0,v.v_)(l.secondTurnScorePlayer1),1),(0,u.Lk)("p",g,(0,v.v_)(l.thirdTurnScorePlayer1),1),(0,u.Lk)("p",b,(0,v.v_)(l.totalScores.player1),1)]),(0,u.Lk)("p",m,"AVG "+(0,v.v_)(l.averageScore.player1),1),(0,u.Lk)("p",C,(0,v.v_)(l.isPlayer1Turn?"DIN TUR":""),1)]),(0,u.Lk)("div",null,[(0,u.Lk)("p",P,(0,v.v_)(l.player1Wins)+" - "+(0,v.v_)(l.player2Wins),1)]),(0,u.Lk)("div",_,[(0,u.Lk)("h2",{class:"name",onClick:r[1]||(r[1]=e=>l.changePlayerName(2))},(0,v.v_)(l.player2Name),1),(0,u.Lk)("p",E,(0,v.v_)(l.player2Checkout),1),(0,u.Lk)("div",W,[(0,u.Lk)("p",w,(0,v.v_)(l.totalScores.player2),1),(0,u.Lk)("p",N,(0,v.v_)(l.lastTurnScorePlayer2),1),(0,u.Lk)("p",R,(0,v.v_)(l.secondTurnScorePlayer2),1),(0,u.Lk)("p",K,(0,v.v_)(l.thirdTurnScorePlayer2),1)]),(0,u.Lk)("p",I,"AVG "+(0,v.v_)(l.averageScore.player2),1),(0,u.Lk)("p",B,(0,v.v_)(l.isPlayer1Turn?"":"DIN TUR"),1)])]),(0,u.Lk)("div",O,[(0,u.bo)((0,u.Lk)("input",{type:"number","onUpdate:modelValue":r[2]||(r[2]=e=>l.currentScore=e),placeholder:"Score",id:"scoreInput",autofocus:"",onKeyup:r[3]||(r[3]=(0,t.jR)(((...e)=>l.submitScore&&l.submitScore(...e)),["enter"]))},null,544),[[t.Jo,l.currentScore]]),(0,u.Lk)("a",{class:"button delete",onClick:r[4]||(r[4]=(...e)=>l.deleteLastNum&&l.deleteLastNum(...e))},"SLET")]),(0,u.Lk)("div",A,[((0,u.uX)(),(0,u.CE)(u.FK,null,(0,u.pI)([7,8,9,4,5,6,1,2,3],(e=>(0,u.Lk)("a",{class:"button",key:e,onClick:r=>l.updateCurrentScore(e),disabled:!l.isPlayer1Turn},(0,v.v_)(e),9,H))),64)),(0,u.Lk)("a",{class:"button double",onClick:r[5]||(r[5]=e=>l.updateCurrentScore(0)),disabled:!l.isPlayer1Turn},"0",8,j),(0,u.Lk)("a",{class:"button submit",onClick:r[6]||(r[6]=(...e)=>l.submitScore&&l.submitScore(...e))},"ENTER")]),x,(0,u.Lk)("div",$,[(0,u.Lk)("a",{class:"button",onClick:r[7]||(r[7]=e=>l.setPredefinedScore(201)),disabled:!l.isPlayer1Turn},"201",8,G),(0,u.Lk)("a",{class:"button",onClick:r[8]||(r[8]=e=>l.setPredefinedScore(301)),disabled:!l.isPlayer1Turn},"301",8,V),(0,u.Lk)("a",{class:"button",onClick:r[9]||(r[9]=e=>l.setPredefinedScore(501)),disabled:!l.isPlayer1Turn},"501",8,F),(0,u.Lk)("a",{class:"button",onClick:r[10]||(r[10]=e=>l.setPredefinedScore(701)),disabled:!l.isPlayer1Turn},"701",8,M),(0,u.Lk)("a",{class:"button",onClick:r[11]||(r[11]=e=>l.setPredefinedScore(1e3)),disabled:!l.isPlayer1Turn},"1000",8,U),(0,u.Lk)("a",{class:"button switch-turns",onClick:r[12]||(r[12]=(...e)=>l.switchTurns&&l.switchTurns(...e))},"Skift tur"),(0,u.Lk)("a",{class:"button switch-turns",onClick:r[13]||(r[13]=(...e)=>l.undoLastTurn&&l.undoLastTurn(...e))},"Fortryd tur"),(0,u.Lk)("a",{class:"button switch-turns",onClick:r[14]||(r[14]=(...e)=>l.resetWins&&l.resetWins(...e))},"Nulstil total")]),q,(0,u.Lk)("table",J,[X,(0,u.Lk)("thead",null,[(0,u.Lk)("tr",null,[z,(0,u.Lk)("th",null,(0,v.v_)(l.player1Name),1),(0,u.Lk)("th",null,(0,v.v_)(l.player2Name),1)])]),(0,u.Lk)("tbody",null,[(0,u.Lk)("tr",null,[Q,(0,u.Lk)("td",Z,(0,v.v_)(l.averageScore.player1),1),(0,u.Lk)("td",null,(0,v.v_)(l.averageScore.player2),1)]),(0,u.Lk)("tr",null,[Y,(0,u.Lk)("td",null,(0,v.v_)(l.averageSetScore.player1),1),(0,u.Lk)("td",null,(0,v.v_)(l.averageSetScore.player2),1)]),(0,u.Lk)("tr",null,[ee,(0,u.Lk)("td",null,(0,v.v_)(l.highestThreeDartScore.player1),1),(0,u.Lk)("td",null,(0,v.v_)(l.highestThreeDartScore.player2),1)]),(0,u.Lk)("tr",null,[re,(0,u.Lk)("td",null,(0,v.v_)(l.lowestThreeDartScore.player1),1),(0,u.Lk)("td",null,(0,v.v_)(l.lowestThreeDartScore.player2),1)]),(0,u.Lk)("tr",null,[ae,(0,u.Lk)("td",null,(0,v.v_)(l.player1HighestCheckout),1),(0,u.Lk)("td",null,(0,v.v_)(l.player2HighestCheckout),1)])])])])}a(4114);function ue(e){switch(e){case 170:return"T20, T20, B50";case 169:return"No checkout";case 168:return"No checkout";case 167:return"T20, T19, B50";case 166:return"No checkout";case 165:return"No checkout";case 164:return"T20, T18, B50";case 163:return"No checkout";case 162:return"No checkout";case 161:return"T20, T17, B50";case 160:return"T20, T20, D20";case 159:return"No checkout";case 158:return"T20, T20, D19";case 157:return"T20, T19, D20";case 156:return"T20, T20, D18";case 155:return"T20, T19, D19";case 154:return"T20, T18, D20";case 153:return"T20, T19, D18";case 152:return"T20, T20, D16";case 151:return"T20, T17, D20";case 150:return"T20, T18, D18";case 149:return"T20, T19, D16";case 148:return"T20, T20, D14";case 147:return"T20, T17, D18";case 146:return"T20, T18, D16";case 145:return"T20, T15, D20";case 144:return"T20, T20, D12";case 143:return"T20, T17, D16";case 142:return"T20, T14, D20";case 141:return"T20, T15, D18";case 140:return"T20, T16, D16";case 139:return"T19, T14, D20";case 138:return"T20, T18, D12";case 137:return"T20, T19, D10";case 136:return"T20, T20, D8";case 135:return"B25, T20, B50";case 134:return"T20, T14, D16";case 133:return"T20, T19, D8";case 132:return"B25, T19, B50";case 131:return"T20, T13, D16";case 130:return"T20, T20, D5";case 129:return"T19, T16, D12";case 128:return"T18, T14, D16";case 127:return"T20, T17, D8";case 126:return"T19, 19, B50";case 125:return"B50, T20, D20";case 124:return"T20, T16, D8";case 123:return"T19, T16, D9";case 122:return"T18, T18, D7";case 121:return"T20, T11, D14";case 120:return"T20, 20, D20";case 119:return"T20, 19, B50";case 118:return"T20, 18, D20";case 117:return"T20, 17, D20";case 116:return"T20, 16, D20";case 115:return"T20, 15, D20";case 114:return"T20, 14, D20";case 113:return"T20, 13, D20";case 112:return"T20, 12, D20";case 111:return"T20, 11, D20";case 110:return"T20, 10, D20";case 109:return"T20, 9, D20";case 108:return"T20, 16, D16";case 107:return"T19, 10, D20";case 106:return"T20, 6, D20";case 105:return"T20, 5, D20";case 104:return"T18, 18, D16";case 103:return"T20, 3, D20";case 102:return"T20, 10, D16";case 101:return"T17, 10, D20";case 100:return"T20, D20";case 99:return"T19, 10, D16";case 98:return"T20, D19";case 97:return"T19, D20";case 96:return"T20, D18";case 95:return"T19, D19";case 94:return"T18, D20";case 93:return"T19, D18";case 92:return"T20, D16";case 91:return"T17, D20";case 90:return"T20, D15";case 89:return"T19, D16";case 88:return"T20, D14";case 87:return"T17, D18";case 86:return"T18, D16";case 85:return"T15, D20";case 84:return"T20, D12";case 83:return"T17, D16";case 82:return"B50, D16";case 81:return"T19, D12";case 80:return"T20, D10";case 79:return"T13, D20";case 78:return"T18, D12";case 77:return"T19, D10";case 76:return"T20, D8";case 75:return"T17, D12";case 74:return"T14, D16";case 73:return"T19, D8";case 72:return"T16, D12";case 71:return"T13, D16";case 70:return"T18, D8";case 69:return"T19, D6";case 68:return"T20, D4";case 67:return"T17, D8";case 66:return"T10, D18";case 65:return"T19, D4";case 64:return"T16, D8";case 63:return"T13, D12";case 62:return"T10, D16";case 61:return"T15, D8";case 60:return"20, D20";case 59:return"19, D20";case 58:return"18, D20";case 57:return"17, D20";case 56:return"16, D20";case 55:return"15, D20";case 54:return"14, D20";case 53:return"13, D20";case 52:return"12, D20";case 51:return"11, D20";case 50:return"10, D20 or B50";case 49:return"9, D20";case 48:return"16, D16";case 47:return"15, D16";case 46:return"14, D16";case 45:return"13, D16";case 44:return"12, D16";case 43:return"11, D16";case 42:return"10, D16";case 41:return"9, D16";case 40:return"D20";case 39:return"7, D16";case 38:return"D19";case 37:return"5, D16";case 36:return"D18";case 35:return"3, D16";case 34:return"D17";case 33:return"1, D16";case 32:return"D16";case 31:return"15, D8";case 30:return"D15";case 29:return"13, D8";case 28:return"D14";case 27:return"11, D8";case 26:return"D13";case 25:return"9, D8";case 24:return"D12";case 23:return"7, D8";case 22:return"D11";case 21:return"5, D8";case 20:return"D10";case 19:return"3, D8";case 18:return"D9";case 17:return"1, D8";case 16:return"D8";case 15:return"7, D4";case 14:return"D7";case 13:return"5, D4";case 12:return"D6";case 11:return"3, D4";case 10:return"D5";case 9:return"1, D4";case 8:return"D4";case 7:return"3, D2";case 6:return"D3";case 5:return"1, D2";case 4:return"D2";case 3:return"1, D1";case 2:return"D1";default:return""}}var le=ue,se=a(144),ne=a(4161),ce=a(8446),oe={setup(){const e=(0,p.lq)(),r=(0,ne.C3)(),a=(0,ne.KR)(r,"scores"),t=(0,se.KR)({player1:501,player2:501}),l=(0,se.KR)(""),s=(0,se.KR)(!1),n=(0,se.KR)("Borg Dart"),c=(0,se.KR)("Player 1"),o=(0,se.KR)("Player 2"),i=(0,se.KR)(0),v=(0,se.KR)(0),T=(0,se.KR)(""),y=(0,se.KR)(""),d=(0,se.KR)([]),D=(0,se.KR)([]),h=(0,se.KR)([]),k=(0,se.KR)([]),S=(0,se.KR)(0),f=(0,se.KR)(0),L=e=>e%1===0?e.toString():e.toFixed(1),g=(0,u.EW)((()=>({player1:d.value.length>0?L(d.value.reduce(((e,r)=>e+r),0)/d.value.length):0,player2:D.value.length>0?L(D.value.reduce(((e,r)=>e+r),0)/D.value.length):0}))),b=(0,u.EW)((()=>({player1:h.value.length>0?L(h.value.reduce(((e,r)=>e+r),0)/h.value.length):0,player2:k.value.length>0?L(k.value.reduce(((e,r)=>e+r),0)/k.value.length):0}))),m=(0,u.EW)((()=>({player1:Math.max(...h.value,0),player2:Math.max(...k.value,0)})));console.log("player1SetScores",h);const C=(0,u.EW)((()=>({player1:h.value.length>0?Math.min(...h.value.filter((e=>e>=0))):"0",player2:k.value.length>0?Math.min(...k.value.filter((e=>e>=0))):"0"})));console.log("lowestThreeDartScore",C);const P=(0,u.EW)((()=>d.value.length>0?d.value[d.value.length-1]:0)),_=(0,u.EW)((()=>D.value.length>0?D.value[D.value.length-1]:0)),E=(0,u.EW)((()=>d.value.length>0?d.value[d.value.length-2]:"")),W=(0,u.EW)((()=>D.value.length>0?D.value[D.value.length-2]:"")),w=(0,u.EW)((()=>d.value.length>0?d.value[d.value.length-3]:"")),N=(0,u.EW)((()=>D.value.length>0?D.value[D.value.length-3]:"")),R=()=>{(0,ne.Zy)(a,(e=>{const r=e.val();r&&(t.value=r,s.value=r.isPlayer1Turn,n.value=r.scoreboardTitle||"Borg Dart",c.value=r.player1Name||"Player 1",o.value=r.player2Name||"Player 2",i.value=r.player1Wins||0,v.value=r.player2Wins||0,T.value=r.player1Checkout||"",y.value=r.player2Checkout||"",d.value=r.player1Scores||[],D.value=r.player2Scores||[],h.value=r.player1SetScores||[],k.value=r.player2SetScores||[],S.value=r.player1HighestCheckout||0,f.value=r.player2HighestCheckout||0)}))};function K(e){l.value=`${l.value}${e}`}const I=()=>{const r=e.query.player;if(!r||"1"!==r&&"2"!==r)return void alert("Invalid player number!");if("1"===r&&!s.value||"2"===r&&s.value)return void alert("Ikke din tur klovn!");const u=parseInt(l.value);if(isNaN(u))return l.value="",void("1"===r?(d.value.push(0),h.value.push(0),(0,ne.yo)(a,{player1Scores:d.value,player1SetScores:h.value,isPlayer1Turn:!s.value})):(D.value.push(0),k.value.push(0),(0,ne.yo)(a,{player2Scores:D.value,player2SetScores:k.value,isPlayer1Turn:!s.value})));if(u>180)return alert("Duuude din score kan ikke være højere end 180."),void(l.value="");const n=`player${r}`;let p=t.value[n]-u;if(p<0)return alert("Kan ikke være under 0..."),void(l.value="");if(0===p){const e=`${"1"===r?c.value:o.value} vandt!`;(0,ce.A)({particleCount:100,spread:70,origin:{y:.6}});const t="player1"===n?"player1Wins":"player2Wins",s=("player1Wins"===t?i.value:v.value)+1;return"1"===r?u>S.value&&(S.value=u,(0,ne.yo)(a,{player1HighestCheckout:u})):u>f.value&&(f.value=u,(0,ne.yo)(a,{player2HighestCheckout:u})),(0,ne.yo)(a,{[n]:p,[t]:s,scoreboardTitle:e}),l.value="",void("1"===r?(d.value.push(u),h.value.push(u),(0,ne.yo)(a,{player1Scores:d.value,player1SetScores:h.value})):(D.value.push(u),k.value.push(u),(0,ne.yo)(a,{player2Scores:D.value,player2SetScores:k.value})))}if((0,ne.yo)(a,{[n]:p}),l.value="","1"===r?(d.value.push(u),h.value.push(u),(0,ne.yo)(a,{player1Scores:d.value,player1SetScores:h.value})):(D.value.push(u),k.value.push(u),(0,ne.yo)(a,{player2Scores:D.value,player2SetScores:k.value})),p<=170){const e=le(p),r="player1"===n?"player1Checkout":"player2Checkout";(0,ne.yo)(a,{[r]:e})}(0,ne.yo)(a,{isPlayer1Turn:!s.value})},B=e=>{window.confirm(`Nulstil score til ${e}. Er du sikker?`)&&(0,ne.yo)(a,{player1Checkout:"",player2Checkout:"",isPlayer1Turn:!0,player1:e,player2:e,player1Scores:[],player2Scores:[],scoreboardTitle:"Borg Dart"})},O=()=>{(0,ne.yo)(a,{isPlayer1Turn:!s.value})},A=()=>{window.confirm("Er du sikker på at du vil nulstille total score?")&&(0,ne.yo)(a,{player1Wins:0,player2Wins:0,player1Checkout:"",player2Checkout:"",isPlayer1Turn:!0,lastTurnScorePlayer1:0,lastTurnScorePlayer2:0,secondTurnScorePlayer1:"",secondTurnScorePlayer2:"",thirdTurnScorePlayer1:"",thirdTurnScorePlayer2:"",player1:501,player2:501,player1Scores:[],player2Scores:[],player1SetScores:[],player2SetScores:[],player1HighestCheckout:0,player2HighestCheckout:0,scoreboardTitle:"Borg Dart"})},H=()=>{const e=s.value?"2":"1",r=`player${e}`,u=`lastTurnScorePlayer${e}`,l="1"===e?P.value:_.value;if(window.confirm(`Fortryd ${l} point. Er du sikker?`)){if(0===l)return void alert("Ingen tidligere score at fortryde.");(0,ne.yo)(a,{[r]:t.value[r]+l,[u]:0}).then((()=>{"1"===e?(t.value.player1+=l,P.value=0,d.value.pop(),h.value.pop(),(0,ne.yo)(a,{player1Scores:d.value})):(t.value.player2+=l,_.value=0,D.value.pop(),k.value.pop(),(0,ne.yo)(a,{player2Scores:D.value})),s.value=!s.value,(0,ne.yo)(a,{isPlayer1Turn:s.value})})).catch((e=>{console.error("Error undoing last turn:",e)}))}},j=e=>{const r=prompt(`Indtast nyt navn for Spiller ${e}:`);if(r&&""!==r.trim()){const t=`player${e}Name`;(0,ne.yo)(a,{[t]:r.trim()})}};function x(){l.value.length>0&&(l.value=l.value.slice(0,-1))}return(0,u.sV)(R),{totalScores:t,currentScore:l,submitScore:I,setPredefinedScore:B,updateCurrentScore:K,isPlayer1Turn:s,scoreboardTitle:n,switchTurns:O,changePlayerName:j,player1Name:c,player2Name:o,deleteLastNum:x,player1Wins:i,player2Wins:v,resetWins:A,lastTurnScorePlayer1:P,lastTurnScorePlayer2:_,secondTurnScorePlayer1:E,secondTurnScorePlayer2:W,thirdTurnScorePlayer1:w,thirdTurnScorePlayer2:N,undoLastTurn:H,player1Checkout:T,player2Checkout:y,player1HighestCheckout:S,player2HighestCheckout:f,averageScore:g,averageSetScore:b,highestThreeDartScore:m,lowestThreeDartScore:C}}};const ie=(0,c.A)(oe,[["render",te],["__scopeId","data-v-452fd2ec"]]);var pe=ie;const ve=[{path:"/",name:"Score",component:pe}],Te=(0,p.aE)({history:(0,p.LA)("/dart/"),routes:ve});var ye=Te,de=a(6400);const De={apiKey:"AIzaSyA0jBJcDcmDmSzaoxDLbAoIrs4SqJQOGVI",authDomain:"dart-70ff4.firebaseapp.com",databaseURL:"https://dart-70ff4-default-rtdb.europe-west1.firebasedatabase.app",projectId:"dart-70ff4",storageBucket:"dart-70ff4.appspot.com",messagingSenderId:"769498204464",appId:"1:769498204464:web:c8c9ebefd1590787a4e0f5"};(0,de.Wp)(De),(0,t.Ef)(i).use(ye).mount("#app")}},r={};function a(t){var u=r[t];if(void 0!==u)return u.exports;var l=r[t]={exports:{}};return e[t].call(l.exports,l,l.exports,a),l.exports}a.m=e,function(){var e=[];a.O=function(r,t,u,l){if(!t){var s=1/0;for(i=0;i<e.length;i++){t=e[i][0],u=e[i][1],l=e[i][2];for(var n=!0,c=0;c<t.length;c++)(!1&l||s>=l)&&Object.keys(a.O).every((function(e){return a.O[e](t[c])}))?t.splice(c--,1):(n=!1,l<s&&(s=l));if(n){e.splice(i--,1);var o=u();void 0!==o&&(r=o)}}return r}l=l||0;for(var i=e.length;i>0&&e[i-1][2]>l;i--)e[i]=e[i-1];e[i]=[t,u,l]}}(),function(){a.n=function(e){var r=e&&e.__esModule?function(){return e["default"]}:function(){return e};return a.d(r,{a:r}),r}}(),function(){a.d=function(e,r){for(var t in r)a.o(r,t)&&!a.o(e,t)&&Object.defineProperty(e,t,{enumerable:!0,get:r[t]})}}(),function(){a.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){a.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)}}(),function(){var e={524:0};a.O.j=function(r){return 0===e[r]};var r=function(r,t){var u,l,s=t[0],n=t[1],c=t[2],o=0;if(s.some((function(r){return 0!==e[r]}))){for(u in n)a.o(n,u)&&(a.m[u]=n[u]);if(c)var i=c(a)}for(r&&r(t);o<s.length;o++)l=s[o],a.o(e,l)&&e[l]&&e[l][0](),e[l]=0;return a.O(i)},t=self["webpackChunkdart_score_app"]=self["webpackChunkdart_score_app"]||[];t.forEach(r.bind(null,0)),t.push=r.bind(null,t.push.bind(t))}();var t=a.O(void 0,[504],(function(){return a(8688)}));t=a.O(t)})();
//# sourceMappingURL=app.ce3a6a91.js.map
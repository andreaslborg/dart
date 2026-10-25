<template>
  <div id="app">
    <div v-if="!authState.ready" class="boot" aria-hidden="true"></div>
    <PasswordGate v-else-if="!unlocked" @unlocked="unlock" />
    <template v-else>
      <router-view/>
      <AppDialog />
    </template>
  </div>
</template>

<script>
import { computed, watch } from 'vue';
import AppDialog from './components/AppDialog.vue';
import PasswordGate from './components/PasswordGate.vue';
import { initDeviceSettings, startSharedSettings } from './settings';
import { authState, initAuth } from './auth';

// The old cookie-only gate is replaced by a real Firebase login.
document.cookie = 'borgdart_access=; Max-Age=0; Path=/';

export default {
  name: 'App',
  components: {
    AppDialog,
    PasswordGate,
  },
  setup() {
    initDeviceSettings();
    initAuth();
    const unlocked = computed(() => Boolean(authState.user));
    // The database is only read once signed in (the rules require it).
    watch(unlocked, (on) => { if (on) startSharedSettings(); }, { immediate: true });
    const unlock = () => {};
    return { authState, unlocked, unlock };
  },
}
</script>

<style>
:root,
:root[data-theme="dark"] {
  --bg: #0E0F12;
  --surface: #181A20;
  --key: #1E2027;
  --key-hover: #272A33;
  --key2: #23262E;
  --line: #2A2D36;
  --line2: #262932;
  --text: #F2F2EE;
  --muted: #9AA0AD;
  --soft: #C5C9D2;
  --faint: #6B7080;
  --accent: #5B95FF;
  --accent-hover: #7AAAFF;
  --chart: #4A85F5;
  --p1: #4A85F5;
  --p2: #D9762E;
  --p3: #1FA39B;
  --p4: #C25BC4;
  --on-accent: #0E0F12;
  --gold: #FFB547;
  --on-gold: #0E0F12;
  --gold-text: #FFB547;
  --danger: #FF9B8A;
  --danger-hover: #FFB3A6;
  --bad-bg: #3A2A2A;
  --placeholder: #3A3E49;
  --backdrop: rgba(14, 15, 18, 0.8);
  --shadow: rgba(0, 0, 0, 0.5);
  --display: 'Barlow Condensed', 'Arial Narrow', sans-serif;
  color-scheme: dark;
}

:root[data-theme="light"] {
  --bg: #F3F4F6;
  --surface: #FFFFFF;
  --key: #ECEEF2;
  --key-hover: #E1E4EA;
  --key2: #E4E7EC;
  --line: #D5D9E0;
  --line2: #E7E9EE;
  --text: #14161B;
  --muted: #5D6370;
  --soft: #353A45;
  --faint: #8A909C;
  --accent: #2F6FE4;
  --accent-hover: #255CC4;
  --chart: #2F6FE4;
  --p1: #2F6FE4;
  --p2: #B8621F;
  --p3: #0A8F84;
  --p4: #A33FA8;
  --on-accent: #FFFFFF;
  --gold: #F2A93B;
  --on-gold: #14161B;
  --gold-text: #A35F00;
  --danger: #C9452F;
  --danger-hover: #A93522;
  --bad-bg: #FBE3DF;
  --placeholder: #A9AEB8;
  --backdrop: rgba(20, 22, 28, 0.45);
  --shadow: rgba(20, 22, 28, 0.18);
  color-scheme: light;
}

/* Stop iPhone zooming in when keys are tapped quickly (e.g. "0", "0"). */
html {
  touch-action: manipulation;
  -webkit-text-size-adjust: 100%;
}

button,
a,
input,
select,
label {
  touch-action: manipulation;
}

button {
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

html,
body {
  margin: 0;
  min-height: 100%;
  background: var(--bg);
  transition: background-color 0.2s;
}

/* ---------- "Lås til spil": one fixed screen, no scrolling ---------- */
html.game-locked,
html.game-locked body {
  height: 100%;
  overflow: hidden;
  overscroll-behavior: none;
}

html.game-locked body {
  position: fixed;
  inset: 0;
  width: 100%;
}

html.game-locked .lock-hide {
  display: none !important;
}

html.game-locked .game-screen {
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding-top: max(10px, env(safe-area-inset-top));
  padding-bottom: max(10px, env(safe-area-inset-bottom));
}

html.game-locked .game-screen > .lock-col {
  flex: 1;
  min-height: 0;
  width: 100%;
}

html.game-locked .lock-col {
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: 10px;
}

html.game-locked .lock-col > .lock-col {
  flex: 1;
}

/* The keypad takes whatever height is left. */
html.game-locked .keypad {
  flex: 1;
  min-height: 0;
  grid-auto-rows: minmax(0, 1fr);
}

html.game-locked .keypad .key {
  height: auto;
  min-height: 40px;
}

html.game-locked .q-row {
  min-height: 40px;
  padding-top: 4px;
  padding-bottom: 4px;
}

.boot {
  min-height: 100vh;
  background: var(--bg);
}

/* Opened from the home screen on iPhone the page runs under the status bar:
   keep content clear of the notch and the home indicator. */
html:not(.game-locked) #app {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

#app {
  font-family: 'Barlow', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text);
  margin: 0;
}
</style>

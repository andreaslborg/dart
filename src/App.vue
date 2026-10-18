<template>
  <div id="app">
    <PasswordGate v-if="!unlocked" @unlocked="unlock" />
    <template v-else>
      <router-view/>
      <AppDialog />
    </template>
  </div>
</template>

<script>
import { ref } from 'vue';
import AppDialog from './components/AppDialog.vue';
import PasswordGate from './components/PasswordGate.vue';
import { initDeviceSettings, startSharedSettings } from './settings';

const COOKIE = 'borgdart_access';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const hasAccess = () => document.cookie.split('; ').some(c => c === `${COOKIE}=1`);

export default {
  name: 'App',
  components: {
    AppDialog,
    PasswordGate,
  },
  setup() {
    initDeviceSettings();
    startSharedSettings();
    const unlocked = ref(hasAccess());
    const unlock = () => {
      const secure = location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `${COOKIE}=1; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
      unlocked.value = true;
    };
    return { unlocked, unlock };
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

html,
body {
  margin: 0;
  min-height: 100%;
  background: var(--bg);
  transition: background-color 0.2s;
}

#app {
  font-family: 'Barlow', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text);
  margin: 0;
}
</style>

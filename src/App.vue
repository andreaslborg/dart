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
html,
body {
  margin: 0;
  min-height: 100%;
  background: #0E0F12;
}

#app {
  font-family: 'Barlow', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #F2F2EE;
  margin: 0;
}
</style>

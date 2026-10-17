<template>
  <div id="app">
    <router-view/>
    <AppDialog />
  </div>
</template>

<script>
import AppDialog from './components/AppDialog.vue';

export default {
  name: 'App',
  components: {
    AppDialog,
  }
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

<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding-top: 20px;
  margin: 0;
}

html {
  margin: 0;
  height: 99%;
  background: rgb(0,0,0);
  background: linear-gradient(354deg, rgba(0,0,0,1) 40%, rgba(0,36,111,1) 80%);
  background-repeat: no-repeat;
  background-attachment: fixed;
}

body {
  height: 99%;
}
</style>

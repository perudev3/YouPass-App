<template>
  <router-view />
</template>

<script>
export default {
  name: 'App',
  
  created() {
    window.onerror = function(msg, src, line, col, err) {
      document.body.style.cssText = 'padding:20px;background:white;';
      document.body.innerHTML = '<b style="color:red">ERROR:</b><br>' + msg + '<br><br>' + (err?.stack || '');
    };
  }
}
</script>

<style>
/* Global */
body, html, .q-page {
  overflow-x: hidden; /* evita scroll horizontal */
  margin: 0;
  padding: 0;
  font-family: 'Roboto', sans-serif;
}
</style>

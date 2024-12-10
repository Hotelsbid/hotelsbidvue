<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import VPSManager from './components/VPSManager.vue';

export default {
  components: {
    VPSManager,
  },
};
</script>

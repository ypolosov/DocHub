<template>
  <v-app class="d-flex">
    <app-header />
    
    <router-view />
  </v-app>
</template>

<script>
  import AppHeader from './app-header.vue';

  export default {
    components: {
      AppHeader
    }
  };
</script>

<template>
  <v-app class="d-flex">
    <app-header />
    
    <app-create-file-page v-if="!hasRootFile" />

    <v-content v-else>
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
  import AppHeader from './app-header.vue';
  import AppCreateFilePage from '@/vscode/app/pages/app-create-file-page.vue';

  export default {
    components: {
      AppHeader,
      AppCreateFilePage
    },
    computed: {
      hasRootFileVsCode() {
        return this.$store.state.hasRootFileVsCode;
      },
      isPlugin() {
        return process.env.VUE_APP_DOCHUB_MODE === 'vs-plugin';
      },
      hasRootFile() {
        return (this.isPlugin && this.hasRootFileVsCode) ||
          !this.isPlugin;
      }
    }
  };
</script>

<style>
  @import '../../../assets/material_icons.css';
</style>

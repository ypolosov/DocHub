<template>
  <v-app class="d-flex">
    <app-header />
    
    <app-create-file-page v-if="isNotInited" />

    <template v-else-if="isLoading">
      <div class="loading-splash" />
      <v-progress-circular
        class="whell"
        v-bind:size="64"
        v-bind:width="7"
        v-bind:value="60"
        color="primary"
        indeterminate />
    </template>

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
    inject: ['vscodeExtensionService'],
    computed: {
      isNotInited() {
        return this.$store.state.notInited;
      },
      isLoading() {
        return this.$store.state.isReloading;
      }
    },
    mounted() {
      this.vscodeExtensionService.checkIsRootManifest();
    }
  };
</script>

<style>
  @import '../../../assets/material_icons.css';

  .loading-splash {
    background: #FFF;
    opacity: 0.7;
    z-index: 10;  
    position: absolute; 
    left: 0; 
    top: 0; 
    bottom: 0; 
    right: 0; 
    filter: blur(8px);
    -webkit-filter: blur(8px);  
  }

  .whell {
    z-index: 100;  
    left: 50%;
    top: 50vh;
    position: absolute !important;
    margin-left: -32px;
    margin-top: -32px;
  }
</style>

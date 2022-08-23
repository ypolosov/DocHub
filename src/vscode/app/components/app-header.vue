<template>
  <div>
    <v-app-bar
      clipped-left
      color="#3495db"
      dark>
      <v-app-bar-nav-icon v-on:click="showMenu = !showMenu">
        <app-header-logo />
      </v-app-bar-nav-icon>

      <v-toolbar-title>
        <router-link v-bind:to="{ name: 'main' }" v-bind:class="$style.link">
          DocHub
        </router-link>
      </v-toolbar-title>

      <v-spacer />
      <app-header-actions />
    </v-app-bar>

    <app-header-sidebar v-bind:show-menu.sync="showMenu" />
  </div>
</template>

<script>
  import AppHeaderActions from './app-header-actions.vue';
  import AppHeaderSidebar from './app-header-sidebar.vue';
  import AppHeaderLogo from './app-header-logo.vue';

  export default {
    components: {
      AppHeaderActions,
      AppHeaderLogo,
      AppHeaderSidebar
    },
    data() {
      return {
        showMenu: false
      };
    }
  };
</script>

<style module>
  .link {
    color: #fff !important;
  }
</style>

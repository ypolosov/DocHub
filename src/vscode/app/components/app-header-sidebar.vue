<template>
  <v-navigation-drawer
    ref="drawer"
    v-model="showMenuSync"
    app
    clipped
    width="350"
    color="grey lighten-4"
    temporary>
    <app-menu />
  </v-navigation-drawer>
</template>

<script>
  import AppMenu from '@/components/Menu.vue';

  export default {
    components: {
      AppMenu
    },
    props: {
      showMenu: { type: Boolean, default: false }
    },
    computed: {
      showMenuSync: {
        get() {
          return this.showMenu;
        },
        set(value) {
          this.$emit('update:show-menu', value);
        }
      }
    }
  };
</script>

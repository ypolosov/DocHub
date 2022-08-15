<template>
  <dochub-doc v-bind:document="document" />
</template>

<script>

  export default {
    name: 'MainPage',
    data() {
      return {};
    },
    computed: {
      document() {
        return process.env.VUE_APP_DOCHUB_ROOT_DOCUMENT || 'dochub.welcome';
      }
    }
  };
</script>

<style scoped>

</style>

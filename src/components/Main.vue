<template>
  <div>
    <dochub-doc v-bind:path="path" />
  </div>
</template>

<script>

  export default {
    name: 'MainPage',
    data() {
      return {};
    },
    computed: {
      path() {
        return '/docs/' + (process.env.VUE_APP_DOCHUB_ROOT_DOCUMENT || 'dochub.welcome');
      }
    }
  };
</script>

<style scoped>

</style>

<template>
  <div>
    <dochub-doc v-bind:path="path" />
  </div>
</template>

<script>

  import env from '@front/helpers/env';

  export default {
    name: 'MainPage',
    data() {
      return {};
    },
    computed: {
      path() {
        return '/docs/' + (env.rootDocument|| 'dochub.welcome');
      }
    }
  };
</script>

<style scoped>

</style>

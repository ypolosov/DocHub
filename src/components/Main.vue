<template>
  <dochub-doc :document="document"></dochub-doc>
</template>

<script>

export default {
  name: 'MainPage',
  computed: {
    document() {
      return process.env.VUE_APP_DOCHUB_ROOT_DOCUMENT || 'dochub.welcome';
    }
  },
  data() {
    return {};
  }
};
</script>

<style scoped>

</style>

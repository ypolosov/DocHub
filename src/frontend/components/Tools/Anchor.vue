<template>
  <a v-bind:id="id" dochub-anchor />
</template>

<script>
  export default {
    name: 'Anchor',
    props: {
      id: { type: String, default: '' }
    },
    data() {
      return {
      };
    }
  };
</script>

<style scoped>
</style>

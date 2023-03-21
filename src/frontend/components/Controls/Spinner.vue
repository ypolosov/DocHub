<template>
  <v-progress-circular
    v-if="isVisible"
    size="64"
    width="7"
    style="left: 50%; top: 50%; position: absolute; margin-left: -32px; margin-top: -32px;"
    value="60"
    color="primary"
    indeterminate />
</template>

<script>
  export default {
    name: 'Spinner',
    data() {
      return {
        isVisible: false
      };
    },
    computed: {
      isLoading() {
        return this.$store.state.isReloading;
      }
    },
    mounted() {
      setTimeout(() => this.isVisible = true, 300);
    }
  };
</script>

<style>

</style>

<template>
  <div style="padding: 36px">
    <v-alert
      style="height:auto"
      dense
      type="error">
      Не удалось получить доступ к GitLab :(
    </v-alert>
  </div>
</template>

<script>

  export default {
    name: 'SSOError',
    data() {
      return {
      };
    }
  };
</script>

<style scoped>
</style>

<template>
  <div>
    test
    <div v-html="content" />
  </div>
</template>

<script>

  export default {
    name: 'HTMLDocument',
    data() {
      return {
        content: ''
      };
    },
    watch: {
      profile() {
        this.refresh();
      }
    },
    mounted() {
      this.refresh();
    },
    methods: {
      refresh() {
        this.getContent(this.profile.source)
          .then((response) => {
            this.content = response.data;
          })
          .catch((error) => {
            this.content = `<v-alert icon="error">Ощибка выполнения запроса [${this.profile.source}]: <br> ${error}</v-alert>`;
          });
      }
    }
  };
</script>

<style scoped>
</style>

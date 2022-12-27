<template>
  <div>
    test2sssdsss
    <div v-html="content" />
    <dochub-object src="@document/dochub.example.swgr" />
  </div>
</template>

<script>

  export default {
    name: 'HTMLDocument',
    props: {
      // Требуем обязательно передавать профайл документа 
      profile: {
        type: Object,
        required: true
      },
      // Требуем обязательно передавать функцию получения контента
      getContent: {
        type: Function,
        required: true
      }
    },
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
        if (this.profile) {
          this.getContent(this.profile.source)
            .then((response) => {
              this.content = response.data;
            })
            .catch((error) => {
              this.content = `<v-alert icon="error">Ощибка выполнения запроса [${this.profile.source}]: <br> ${error}</v-alert>`;
            });
        } else this.content = '';
      }
    }
  };
</script>

<style scoped>
</style>

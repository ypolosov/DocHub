<template>
  <div>
    <v-alert v-if="error" color="warning">
      Здесь должна быть картинка, но что-то пошло не так.<br>
      Проверьте, что ресурс доступен, а CORS политики настроены верно.<br>
      <br>
      Ошибка:<br>
      {{ error }}
    </v-alert>
    <img v-else v-bind:src="data" style="max-width:100%">
  </div>
</template>

<script>
  import requests from '@front/helpers/requests';

  export default {
    name: 'DHImage',
    props: {
      src: { type: String, default: '' },
      baseURI: { type: String, default: '' }
    },
    data() {
      return {
        error: null,
        data: null
      };
    },
    mounted() {
      this.reloadImage();
    },
    methods: {
      reloadImage() {
        const url = new URL(this.src, this.baseURI);
        requests.request(url.toString(), undefined, { responseType: 'arraybuffer' })
          .then((response) => {
            this.data = URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type']}));
          })
          .catch((e) => this.error = e);
      }
    }
  };
</script>

<style scoped>
</style>

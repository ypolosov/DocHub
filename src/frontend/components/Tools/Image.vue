<template>
  <div>
    <v-alert v-if="error" color="warning">
      Здесь должна быть картинка, но что-то пошло не так.<br>
      Проверьте, что ресурс доступен, а CORS политики настроены верно.<br>
      URL: {{ url.toString() }}<br>
      Ошибка: {{ error }}
    </v-alert>
    <img v-else v-bind:src="data" style="max-width:100%">
  </div>
</template>

<script>
  import requests from '@front/helpers/requests';
  import uriTool from '@front/helpers/uri';

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
    computed: {
      url() {
        return uriTool.makeURL(this.src, this.baseURI).url;
      }
    },
    mounted() {
      this.reloadImage();
    },
    methods: {
      reloadImage() {
        requests.request(this.src, this.baseURI, { responseType: 'arraybuffer' })
          .then((response) => {
            this.data = URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type']}));
          })
          .catch((e) => {
            this.error = e;
          });
      }
    }
  };
</script>

<style scoped>
</style>

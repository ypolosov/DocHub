<template>
  <img v-bind:src="data" style="max-width:100%">
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
          });
      }
    }
  };
</script>

<style scoped>
</style>

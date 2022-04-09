<template>
  <img :src="data"/>
</template>

<script>


import requests from '../../helpers/requests';

export default {
  name: 'Image_',
  mounted() {
    this.reloadImage();
  },
  methods: {
    reloadImage() {
      requests.request(this.src, this.baseURI, {responseType: 'arraybuffer'})
        .then((response) => {
          this.data = URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type']}));
        });
    }
  },
  props: {
    src: String,
    baseURI: String
  },
  data() {
    return {
      data: null
    };
  }
};
</script>

<style scoped>
</style>

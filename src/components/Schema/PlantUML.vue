<template>
  <div v-html="svg">
  </div>
</template>

<script>

import axios from 'axios';
import plantUML from '../../helpers/plantuml'
// import DSL from '!!raw-loader!./../../assets/dsl.txt'

export default {
  name: 'PlantUML',
  mounted() {
    this.reloadSVG();
  },
  methods: {
    onClickRef(event) {
      const url = new URL(event.currentTarget.href.baseVal);
      this.$router.push({ path: url.pathname});
      return false;
    },
    bindHREF() {
      const refs = this.$el.querySelectorAll('[href]');
      for (let i = 0; i < refs.length; i++) {
        const ref = refs[i];
        ref.onclick = this.onClickRef;
      }
    },
    reloadSVG() {
      axios({
        url: plantUML.svgURL(this.uml)
      }).then((response) => {
        this.svg = response.data.toString();
        this.$nextTick(() => this.bindHREF());
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
    }
  },
  watch: {
    uml() {
      this.reloadSVG();
    }
  },
  props: {
    uml: String
  },
  data() {
    return {
      svg: ''
    };
  }
};
</script>

<style scoped>

</style>

<template>
  <div v-html="svg" class="plantuml-schema">
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
      const url = new URL(event.currentTarget.href.baseVal, window.location);
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
    rebuildLinks() {
      const refs = this.$el.querySelectorAll('[href]');
      for (let i = 0; i < refs.length; i++) {
        const ref = refs[i];
        ref.onclick = this.onClickRef;
      }
    },
    prepareSVG() {
      const svg = this.$el.querySelectorAll('svg')[0];
      if (svg) {
        svg.style = null;
        this.bindHREF();
        if (this.postrender) this.postrender(svg);
      }
    },
    reloadSVG() {
      if (!this.uml) {
        this.svg = '';
        return;
      }

      axios({
        url: plantUML.svgURL(this.uml)
      }).then((response) => {
        this.svg = response.data.toString();
        this.$nextTick(() => this.prepareSVG());
      }).catch((error) => {
        if (error.response && error.response.status === 400) {
          this.svg = error.response.data.toString();
          this.$nextTick(() => this.prepareSVG());
        }
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
    uml: String,          // PlantUML диаграмма
    postrender: Function, // POST обработчик
  },
  data() {
    return {
      svg: ''
    };
  }
};
</script>

<style>

.plantuml-schema svg {
  max-width: 100%;
  height: auto;
}

</style>

<template>
  <div v-html="svg" class="plantuml-schema"
    :style="{cursor: cursor}"
    @mousedown.prevent="onMouseDown"
    @mousemove.prevent="onMouseMove"
    @mouseup.prevent="onMouseUp"
    @mouseleave.prevent="onMouseUp"
  >
  </div>
</template>

<script>

import axios from 'axios';
import plantUML from '../../helpers/plantuml'
// import DSL from '!!raw-loader!./../../assets/dsl.txt'

export default {
  name: 'PlantUML',
  created() {
    window.addEventListener('mousewheel', this.proxyScrollEvent);
  },
  destroyed () {
    window.removeEventListener('mousewheel', this.proxyScrollEvent);
  },
  mounted() {
    this.reloadSVG();
  },
  methods: {
    onMouseDown (event) {
      if (!event.shiftKey) return;
      this.isMove = true;
      this.moveX = event.clientX;
      this.moveY = event.clientY;
    },
    onMouseMove (event) {
      this.isShiftSens = event.shiftKey;
      if (!this.isMove) return;
      this.viewBox.x += (this.moveX - event.clientX) * (this.koofScreenX || 0);
      this.viewBox.y += (this.moveY - event.clientY) * (this.koofScreenY || 0);
      this.moveX = event.clientX;
      this.moveY = event.clientY;
    },
    onMouseUp () {
      this.isMove = false;
    },
    doZoom (value, x, y) {
      const kX = x / (this.svgEl.clientWidth || x);
      const kY = y / (this.svgEl.clientHeight || y);
      // eslint-disable-next-line no-console
      console.info('kX=', kX, 'kY=', kY);
      let resizeWidth = value * this.viewBox.width;
      let resizeHeight = value * this.viewBox.height;
      this.viewBox.x -= resizeWidth * kX;
      this.viewBox.width += resizeWidth;
      this.viewBox.y -= resizeHeight * kY;
      this.viewBox.height += resizeHeight;
      this.cacheViewBox = null;
    },
    proxyScrollEvent (event) {
      if (!event.shiftKey) return;
      let e = window.event || event;
      switch (Math.max(-1, Math.min(1, (e.deltaY || -e.detail)))) {
        case 1:
          this.doZoom(this.zoom.step, event.offsetX, event.offsetY);
          break;
        case -1:
          this.doZoom(-this.zoom.step, event.offsetX, event.offsetY);
          break;
      }
      event.stopPropagation();
    },
    onClickRef(event) {
      const url = new URL(event.currentTarget.href.baseVal, window.location);
      this.$router.push({ path: url.pathname});
      return false;
    },
    bindHREF() {
      const refs = this.svgEl.querySelectorAll('[href]');
      for (let i = 0; i < refs.length; i++) {
        const ref = refs[i];
        ref.onclick = this.onClickRef;
      }
    },
    rebuildLinks() {
      const refs = this.svgEl.querySelectorAll('[href]');
      for (let i = 0; i < refs.length; i++) {
        const ref = refs[i];
        ref.onclick = this.onClickRef;
      }
    },
    prepareSVG() {
      this.svgEl = this.$el.querySelectorAll('svg')[0];
      this.cacheViewBox = null;
      if (this.svgEl) {
        this.svgEl.style = null;
        this.bindHREF();
        if (this.postrender) this.postrender(this.svgEl);
      }
    },
    reloadSVG() {
      // Сбрасываем параметры зума
      this.zoom.value = 1;

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
        } else {
          this.svg = `
            <svg viewBox="0 0 400 80" xmlns="http://www.w3.org/2000/svg">
              <style>
                .small {font: italic 12px sans-serif;}
                .Rrrrr {font: italic 24px serif; fill: red;}
              </style>
              <text x="200" y="40" text-anchor="middle" class="Rrrrr">Ошибка загрузки!</text>
              <text x="200" y="60" text-anchor="middle" class="small">${error}</text>
            </svg>
         `;
        }
        // eslint-disable-next-line no-console
        console.error(error);
      });
    }
  },
  computed: {
    viewBox () {
      if (!this.svgEl) {
        return {
          x: 0,
          y : 0,
          width : 0,
          height : 0
        }
      } else
        return this.cacheViewBox ?
            this.cacheViewBox
            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            : this.cacheViewBox = this.svgEl.viewBox.baseVal;
    },
    // Коэффициент преобразования реальных точек во внутренние по ширине
    koofScreenX () {
      return this.svgEl ? this.viewBox.width / this.svgEl.clientWidth : 1;
    },
    // Коэффициент преобразования реальных точек во внутренние по высоте
    koofScreenY () {
      return this.svgEl ? this.viewBox.height / this.svgEl.clientHeight : 1;
    },
    cursor () {
      return this.isShiftSens ? 'move' : undefined;
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
      svg: '',
      svgEl: null,
      isShiftSens: false, // Признак, что пользователь нажал шифт
      isMove: false, // Признак перемещения схемы
      moveX: 0,
      moveY: 0,
      zoom: {
        value: 1,   // Текущий зум
        step: 0.1,  // Шаг зума
      },
      cacheViewBox: null
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

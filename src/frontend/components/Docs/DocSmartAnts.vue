<template>
  <box>
    <v-card flat class="container" style="padding: 0; margin-top: 12px">
      <v-system-bar
        v-if="!isPrintVersion"
        class="toolbar"
        floating
        flat
        color="#fff"
        dense>
        <v-btn icon title="Экспорт в Excalidraw" v-on:click="exportToExcalidraw">
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <v-btn v-if="selectedNodes" icon title="Кадрировать" v-on:click="doFocus">
          <v-icon>mdi-crop-free</v-icon>
        </v-btn>
        <v-btn v-if="focusNodes" icon title="Полная диаграмма" v-on:click="clearFocus">
          <v-icon>mdi-view-comfy</v-icon>
        </v-btn>
        <v-btn v-if="isUnwisp" icon title="Показать все связи" v-on:click="setUnwisp(false)">
          <v-icon>mdi-arrow-decision-outline</v-icon>
        </v-btn>
        <v-btn v-if="!isUnwisp" icon title="Свернуть связи в жгуты" v-on:click="setUnwisp(true)">
          <v-icon>mdi-arrow-decision-auto</v-icon>
        </v-btn>

        <template v-if="scenario">
          <v-select
            v-model="scenario"
            dense
            item-text="text"
            item-value="id"
            v-bind:items="scenarios" />
          <v-btn
            icon
            title="Проиграть сценарий"
            v-on:click="playScenario">
            <v-icon>{{ isPaying ? 'mdi-stop' : 'mdi-play' }}</v-icon>
          </v-btn>
          <!--
            Имеются проблемы с перемоткой назад. 
            Плохо отрабатывают шаги очистки, т.е. отмотать состояние не удается без артефактов
          <v-btn
            v-if="isPaying"
            icon
            title="Дальше"
            v-on:click="playPrev">
            <v-icon>mdi-skip-previous</v-icon>
          </v-btn>
          -->
          <v-btn
            v-if="isPaying"
            icon
            title="Дальше"
            v-on:click="playNext">
            <v-icon>mdi-skip-next</v-icon>
          </v-btn>
        </template>
      </v-system-bar>       
      <schema 
        ref="schema"
        v-model="status"
        class="schema"
        v-bind:data="data"
        v-on:playstop="onPlayStop"
        v-on:playstart="onPlayStart"
        v-on:selected-nodes="onSelectedNodes"
        v-on:on-click-link="onClickLink"
        v-on:contextmenu="showMenu" 
        v-on:wheel="proxyScrollEvent" /> 
      <v-menu
        v-model="menu.show"
        v-bind:position-x="menu.x"
        v-bind:position-y="menu.y"
        absolute
        offset-y>
        <v-list>
          <template
            v-for="(item, index) in menuItems">
            <v-list-item
              v-if="item"
              v-bind:key="item.id"
              link>
              <v-list-item-title
                v-on:click="item.on(item)">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>
            <v-divider v-else v-bind:key="index" />
          </template>
        </v-list>
      </v-menu>        
    </v-card>
  </box>
</template>

<script>

  import Schema from '@front/components/Schema/DHSchema/DHSchema.vue';
  import href from '@front/helpers/href';
  import download from '@front/helpers/download';

  import DocMixin from './DocMixin';

  export default {
    name: 'DocHubViewpoint',
    components: { 
      Schema 
    },
    mixins: [DocMixin],
    props: {
      document: { type: String, default: '' }
    },
    data() {
      return {
        menu: { // Контекстное меню
          show: false,  // Признак отображения
          x : 0,  // Позиция x
          y : 0,  // Позиция y
          items: (() => {
            const result = [
              { id:'save-svg', title: 'Сохранить на диск SVG', on: () => download.downloadSVG(this.getSvg())},
              { id: 'save-png', title: 'Сохранить на диск PNG', on: () => download.downloadSVGAsPNG(this.getSvg()) }
            ];
            return result;
          }).call()
        },
        cacheViewBox: null,
        zoom: {
          value: 1,   // Текущий зум
          step: 0.1  // Шаг зума
        },
        status: {},             // Текущий статус схемы
        selectedScenario: null, // Выбранный сценарий
        isPaying: false,        // Признак проигрывания
        selectedNodes: null,    // Выбранные ноды
        focusNodes: null,       // Кадрированные ноды
        isUnwisp: false         // Признак группировки связей
      };
    },
    computed: {
      viewBox() {
        if (!this.svgEl) {
          return {
            x: 0,
            y : 0,
            width : 0,
            height : 0
          };
        } else
          return this.cacheViewBox ?
            this.cacheViewBox
            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            : this.cacheViewBox = this.svgEl.viewBox.baseVal;
      },
      svgEl() {
        return this.$refs.schema.$el;
      },
      // Пункты контекстного меню
      menuItems() {
        const result = [].concat(this.contextMenu);
        result.length && result.push(null);
        return result.concat(this.menu.items);
      },
      // Выбранный сценарий анимации
      scenario: {
        set(value) {
          this.selectedScenario = value;
        },
        get() {
          if (this.selectedScenario) return this.selectedScenario;
          const scenarios = this.data?.animation?.scenarios;
          if (!scenarios) return null;
          return Object.keys(scenarios)[0];
        }
      },
      data() {
        let result = Object.assign({}, this.source.dataset || {});
        // Если нужно, оставляем только фокусные ноды и связи между ними
        if (this.focusNodes) {
          const links = [];
          (result.links || []).map((link) => {
            if ((this.focusNodes.indexOf(link.from) >=0 ) && (this.focusNodes.indexOf(link.to) >=0 ))
              links.push(link);
          });

          const nodes = {};
          this.focusNodes.map((id) => nodes[id] = result.nodes[id]);

          result = JSON.parse(JSON.stringify({
            config: result.config,
            symbols: result.symbols,
            links,
            nodes
          }));
        }
        // Если нужно, собираем в жгуты
        this.isUnwisp && (result.links = this.unwispLinks(result.links));
        return result;
      },
      scenarios() {
        const result = [];
        for(const id in this.data?.animation?.scenarios || {}) {
          result.push({
            id,
            text: this.data.animation.scenarios[id].title || id
          });
        }
        return result;
      },
      isTemplate() {
        return true;
      }
    },
    methods: {
      doZoom(value, x, y) {
        const kX = x / (this.svgEl.clientWidth || x);
        const kY = y / (this.svgEl.clientHeight || y);
        let resizeWidth = value * this.viewBox.width;
        let resizeHeight = value * this.viewBox.height;
        this.viewBox.x -= resizeWidth * kX;
        this.viewBox.width += resizeWidth;
        this.viewBox.y -= resizeHeight * kY;
        this.viewBox.height += resizeHeight;
        this.cacheViewBox = null;
      },
      proxyScrollEvent(event) {
        if (!event.ctrlKey) return;
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
      // Возвращает SVG код диаграммы
      getSvg() {
        const addStyle = function(children) {
          for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (child instanceof Element) {
              let cssText = '';
              let computedStyle = window.getComputedStyle(child, null);
              for (let i = 0; i < computedStyle.length; i++) {
                let prop = computedStyle[i];
                cssText += prop + ':' + computedStyle.getPropertyValue(prop) + ';';
              }
              child.setAttribute('style', cssText);
              addStyle(child.childNodes);
            }
          }
        };
        
        
        /*
        const createStyleElementFromCSS = () => {
          // assume index.html loads only one CSS file in <header></header>
          const sheet = document.styleSheets[0];

          const styleRules = [];
          for (let i = 0; i < sheet.cssRules.length; i++)
            styleRules.push(sheet.cssRules.item(i).cssText);

          const style = document.createElement('style');
          style.type = 'text/css';
          style.appendChild(document.createTextNode(styleRules.join(' ')));

          return style;
        };        
        const style = createStyleElementFromCSS();
        svgElement.insertBefore(style, svgElement.firstChild);
        */

        const svgElement = this.$refs.schema.$el;
        addStyle(svgElement.childNodes);

        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svgElement);

        // eslint-disable-next-line no-useless-escape
        if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
          source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        // eslint-disable-next-line no-useless-escape
        if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
          source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }

        return `<?xml version="1.0" standalone="no"?>\r\n${source}`;
      },
      // Выводим контекстное меню
      showMenu(event) {
        this.menu.show = false;
        this.menu.x = event.clientX;
        this.menu.y = event.clientY;
        this.$nextTick(() => {
          this.menu.show = true;
        });
        event.preventDefault();
        event.stopPropagation();
      },      
      //Очистка состояния
      clean() {
        this.status = {};
        this.selectedScenario =null;
        this.isPaying = false;
        this.selectedNodes = null;
        this.focusNodes = null;
        this.isUnwisp = false;

      },
      // Сворачивает связи в жгуты
      unwispLinks(links) {
        const map = {};
        const result = [];
        links.map((link) => {
          let item = map[`${link.from}-${link.to}`] || map[`${link.to}-${link.from}`];
          if (!item) {
            item = Object.assign({}, link);
            item.contains = [link];
            item.title = '';
            map[`${item.from}-${item.to}`] = item;
            result.push(item);
          } else {
            item.contains.push(link);
            const originArrow = {
              start: item.style.slice(0, 1),
              end: item.style.slice(-1)
            };
            const addingArrow = {
              start: link.style.slice(0, 1),
              end: link.style.slice(-1)
            };
            if ((addingArrow.start) === '<' && (originArrow.start !== '<')) {
              item.style = `<${item.style}`;
            }
            if ((addingArrow.end) === '>' && (originArrow.end !== '>')) {
              item.style = `${item.style}>`;
            }
          }
        });
        return result;
      },
      // Устанавливает режим сворачивания связей в жгуты
      setUnwisp(value) {
        this.isUnwisp = value;
      },
      // Очищает фокус
      clearFocus() {
        this.focusNodes = null;
      },
      // Сфокусироваться на выбранных нодах
      doFocus() {
        this.focusNodes = this.selectedNodes ? Object.keys(this.selectedNodes) : null;
      },
      // Обработка клика по ссылке
      onClickLink(link) {
        href.gotoURL(link.link);
      },
      // Изменение выбора нод
      onSelectedNodes(nodes) {
        this.selectedNodes = Object.keys(nodes).length ? nodes : null;
      },
      // Экспорт в Excalidraw
      exportToExcalidraw() {
        this.$refs.schema.$emit('exportToExcalidraw', {
          handler: (content) => download.downloadExcalidraw(content)
        });
      },
      // Событие остановки проигрывания сценария
      onPlayStop() {
        this.isPaying = false;
      },
      // Событие начала проигрывания сценария
      onPlayStart() {
        this.isPaying = true;
      },
      // Команда проиграть сценарий
      playScenario() {
        this.$refs.schema.$emit(this.isPaying ? 'stop' : 'play', this.scenario);
      },
      // Команда перейти на предыдущий шаг немедленно
      // todo нужно доработать возврат 
      playPrev() {
        this.$refs.schema.$emit('prev');
      },
      // Команда перейти на следующий шаг немедленно
      playNext() {
        this.$refs.schema.$emit('next');
      },
      refresh() {
        this.clean();
        this.selectedScenario = null;
        this.isPaying = false;
        this.sourceRefresh();
      }
    }
  };
</script>

<style scoped>
.schema {
  /* border: solid 2px #ff0000; */
  aspect-ratio : 1 / 0.6;
  width: 100%;
  min-width: 100%;
}

.container {
  position: relative;
  text-align: center;
}

.toolbar {
  position: absolute;
  top: 0px;
  left: 6px;
  max-width: calc(100% - 32px);
}
</style>

<template>
  <svg
    class="dochub-schema"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    contentstyletype="text/css"
    preserveAspectRatio="none"
    version="1.1"
    v-bind:viewBox="viewBox"
    zoomAndPan="magnify"
    encoding="UTF-8"
    v-bind:style="style"
    v-on:mousedown="onClickSpace">
    <defs>
      <g v-for="symbol in symbols" v-bind:id="symbol.id" v-bind:key="symbol.id" v-html="symbol.content" />
    </defs>
    <schema-node 
      v-bind:offset-x="0"
      v-bind:offset-y="0"
      v-bind:layer="presentation.layers" 
      v-on:node-click="onNodeClick" />
    <schema-track 
      v-for="track in presentation.tracks"
      v-bind:key="track.id"
      v-bind:track="track" 
      v-on:track-over="onTrackOver(track)"
      v-on:track-click="onTrackClick(track)"
      v-on:track-leave="onTrackLeave(track)" />

    <schema-info
      v-show="animation.information"
      v-bind:x="landscape.viewBox.left + 12" 
      v-bind:width="landscape.viewBox.width - 24" 
      v-bind:text="animation.information" />

    <schema-debug-node 
      v-if="debug"
      v-bind:offset-x="0"
      v-bind:offset-y="0"
      v-bind:layer="presentation.layers" 
      v-on:node-click="onNodeClick" />

    Тут должны была быть схема, но что-то пошло не так...
  </svg>
</template>

<script>
  import SchemaNode from './DHSchemaNode.vue';
  import SchemaTrack from './DHSchemaTrack.vue';
  import SchemaDebugNode from './DHSchemaDebugNode.vue';
  import env from '@/helpers/env';

  if (!env.isProduction() && (process.env.VUE_APP_DOCHUB_SMART_ANTS_SOURCE || 'n').toLocaleLowerCase() === 'y' ) {
    require('../../../hidden/smartants');
  } else {
    require('../../../assets/libs/smartants');
  }

  const  Graph = window.$SmartAnts;

  import DHSchemaAnimationMixin from './DHSchemaAnimationMixin';
  import SchemaInfo from './DHSchemaInfo.vue';

  // SVG примитивы
  import SVGSymbolCloud from '!!raw-loader!./symbols/cloud.xml';  
  import SVGSymbolUser from '!!raw-loader!./symbols/user.xml';  
  import SVGSymbolSystem from '!!raw-loader!./symbols/system.xml';  
  import SVGSymbolDatabase from '!!raw-loader!./symbols/database.xml';  
  import SVGSymbolComponent from '!!raw-loader!./symbols/component.xml';  

  const testMode = 'fixed'; //fixed
  const OPACITY = 0.3;
  const IS_DEBUG = true;

  export default {
    name: 'DHSchema',
    components: {
      SchemaNode,
      SchemaTrack,
      SchemaInfo,
      SchemaDebugNode
    },
    mixins: [ DHSchemaAnimationMixin ],
    props: {
      // Дистанция между объектами на диаграмме
      distance: {
        type: Number,
        default: 70
      },
      // Ширина прогладываемых дорожек
      trackWidth: {
        type: Number,
        default: 28
      },
      // Толщина линии дорожки
      trackStrong: {
        type: Number,
        default: 1
      },
      // 
      voice: {
        type: Boolean,
        default: true
      },  
      data: {
        type: Object,
        default() {
          return {
            symbols: {}, 
            nodes: {},
            links: [],
            animation: {
              actions: {},
              scenarios: []
            }
          };
        }
      }},
    data() {
      return {
        debug: IS_DEBUG ? {
          
        } : null,
        selected: {
          links: {},
          nodes: {}
        },
        landscape: {
          symbols: {},
          viewBox : {
            left: 0,
            top: 0,
            width: 1000,
            height: 400
          }
        },
        presentation: {
          layers: {},
          tracks: []
        },
        style: {}
      };
    },
    computed: {
      // Возвращает определения (defs) примитивов диаграммы
      symbols() {
        const result = [
          {
            id: '$landscape',
            content: '<g></g>'
          },
          {
            id: '$undefined',
            content: '<text>Ошибочка :(</text>'
          },
          {
            id: 'cloud',
            content: SVGSymbolCloud
          },
          {
            id: 'system',
            content: SVGSymbolSystem
          },
          {
            id: 'database',
            content: SVGSymbolDatabase
          },
          {
            id: 'user',
            content: SVGSymbolUser
          },
          {
            id: 'component',
            content: SVGSymbolComponent
          }
        ];
        for (const id in this.data.symbols || {}) {
          result.push({
            id,
            content: this.data.symbols[id]
          });
        }
        return result;
      },
      // Определяем окно видимости
      viewBox() {
        return `${this.landscape.viewBox.left} ${this.landscape.viewBox.top} ${this.landscape.viewBox.width} ${this.landscape.viewBox.height}`;
      }
    },
    watch: {
      data() {
        this.$nextTick(() => this.rebuildPresentation());
      }
    },
    mounted() {
      window.addEventListener('resize', this.rebuildViewBox);
      new ResizeObserver(() => this.rebuildViewBox()).observe(this.$el);

      this.$on('play', (scenario) => {
        this.animateRun(scenario);
      });
      this.$on('stop', () => {
        this.animationStop();
      });
      this.$on('next', () => {
        this.animationNext();
      });
      this.$on('prev', () => {
        this.animationPrev();
      });
      if (testMode === 'random') {
        this.makeRandom();
        setInterval(() => {
          this.makeRandom();
        }, 5000);
      } else {
        this.$nextTick(() => {
          this.rebuildPresentation();
        });
      }
    },
    beforeDestroy(){
      window.removeEventListener('resize', this.rebuildViewBox);
    },
    methods: {
      // Генерация рандомных данных
      makeRandom() {
        const symbols = Object.keys(this.data.symbols);

        // this.clear();
        const selectedNodes = {};
        const randomLinks = [];
        const generateNodes = () => {
          for(const node in this.data.nodes) {
            if (Math.random() * 100 > 50) 
              selectedNodes[node] = Object.assign(this.data.nodes[node],{
                symbol: symbols[Math.round(Math.random() * (symbols.length - 1))]
              });
          }
        };

        let ids = Object.keys(selectedNodes);
        while (ids.length < 3) {
          generateNodes();
          ids = Object.keys(selectedNodes);
        }

        const max = ids.length - 1;
        const linkCount = Math.round(Math.random() * 20 + 5);
        for(let i = 0; i < linkCount; ) {
          const from = Math.round(Math.random() * max);
          const to = Math.round(Math.random() * max);
          const fromID = ids[from];
          const toID = ids[to];
          if (
            (from === to) 
            || (fromID.substring(0, toID.length) === toID)
            || (toID.substring(0, fromID.length) === fromID)
          ) continue;
          randomLinks.push({
            from: fromID,
            to: toID,
            style: ['<->', '<-', '->'][Math.round(Math.random() * 2)],
            title: ['Title 1', 'Title 2', 'Title 3', 'Title 4'][Math.round(Math.random() * 3)]
          });
          ++i;
        }

        this.rebuildPresentation(selectedNodes, randomLinks);
      },
      // Отчистка
      clear() {
        this.presentation = {
          layers: {},
          tracks: []
        };
      },
      // Обновление состояние визуализации нод
      updateNodeView() {
        const map = this.presentation.map;
        const unselected = !Object.keys(this.selected.nodes).length;
        for(const id in map)  {
          const node = map[id];
          this.$set(node, 'opacity', unselected || this.selected.nodes[id] ? 1 : OPACITY);
        }
      },
      // Выделяет ноду
      selectNode(box) {
        this.selected.nodes[box.node.id] = box;
      },
      // Выделяет ноду и ее соседей со связями
      selectNodeAndNeighbors(box) {
        this.selectNode(box);
        this.presentation.tracks.map((track) => {
          if ((track.link.from === box.node.id) || (track.link.to === box.node.id)) {
            this.selected.links[track.id] = track;
            this.selected.nodes[track.link.from] = this.presentation.map[track.link.from];
            this.selected.nodes[track.link.to] = this.presentation.map[track.link.to];
          }
        });
      },
      // Обработка клика по объекту
      onNodeClick(box) {
        if (!window?.event?.shiftKey) {
          this.cleanSelectedTracks();
          this.cleanSelectedNodes();
        }
        this.selectNodeAndNeighbors(box);
        this.updateNodeView();
        this.updateTracksView();
      },
      updateTracksView() {
        const unselected = !Object.keys(this.selected.links).length && !Object.keys(this.selected.nodes).length;
        this.presentation.tracks = this.presentation.tracks.map((track) => {
          if (unselected) {
            this.$set(track, 'animate', false);
            this.$set(track, 'opacity', 1);
          } else {
            this.$set(track, 'highlight', !!this.selected.links[track.id]);
            this.$set(track, 'animate', track.highlight);
            this.$set(track, 'opacity', track.animate ? 1 : OPACITY);
          }
          return track;
        }).sort((track1, track2) => {
          if (track1.highlight && track2.highlight) return -1;
          if (track1.highlight && !track2.highlight) return 0;
          return 1;
        });
      },
      // Фиксируем выбор линка  
      onTrackClick(track) {
        if (!window?.event?.shiftKey) {
          this.cleanSelectedTracks();
          this.cleanSelectedNodes();
        }
        this.selected.links[track.id] = track;
        this.selected.nodes[track.link.from] = this.presentation.map[track.link.from];
        this.selected.nodes[track.link.to] = this.presentation.map[track.link.to];
        this.updateNodeView();
        this.updateTracksView();
      },
      // Обработка событий прохода мышки над связями
      onTrackOver(track) {
        track.highlight =  true;
        this.updateTracksView();
      },
      onTrackLeave(track) {
        if (!this.selected.links[track.id]) {
          this.$set(track, 'highlight', false);
        }
      },
      // Очистка выбора треков
      cleanSelectedTracks() {
        this.selected.links = {};
        this.presentation.tracks.map((track) => {
          this.$set(track, 'animate', false);
          this.$set(track, 'opacity', 1);
          this.$set(track, 'highlight', false);
        });
      },
      // Очистка выбора треков
      cleanSelectedNodes() {
        this.selected.nodes = {};
      },
      // Обработка клика на свободной области
      onClickSpace() {
        this.cleanSelectedTracks();
        this.cleanSelectedNodes();
        this.updateNodeView();
      },
      // Перестроить viewbox
      rebuildViewBox() {
        const width = (this.presentation.layers?.box?.width || 0) + this.distance;
        const height = (this.presentation.layers?.box?.height || 0) + this.distance;
        const clientWidth = this.$el?.clientWidth || 0;
        this.landscape.viewBox.top = 0;
        this.landscape.viewBox.height = height;
        if (width < clientWidth) {
          const delta = (clientWidth - width) * 0.5;
          this.landscape.viewBox.left = - delta;
          this.landscape.viewBox.width = width + delta * 2;
          this.style.height = `${height}`;
        } else {
          this.landscape.viewBox.left = 0;
          this.landscape.viewBox.width = width;
          this.style.height = `${height * (clientWidth / width)}`;
        }
      },
      // Перестроение презентации
      rebuildPresentation(nodes, links) {
        this.recalcSymbols();
        const trackWidth = this.data.config?.trackWidth || this.trackWidth;
        const distance = this.data.config?.distance || this.distance;
        let availableWidth = this.$el?.clientWidth || 0;
        if (availableWidth < 600) availableWidth = 600;
        Graph.make(
          nodes || this.data.nodes || {},
          links || this.data.links || [],
          trackWidth,
          distance,
          this.landscape.symbols,
          availableWidth,
          this.debug
        )
          .then((presentation) => {
            this.presentation = presentation;
            this.rebuildViewBox();
            this.cleanSelectedTracks();
            this.cleanSelectedNodes();
          })
          .catch((e) => {
            console.error(e);
            if (testMode === 'random') this.makeRandom();
          });
      },
      // Рассчитывает размерность примитивов (символов)
      recalcSymbols() {
        this.landscape.symbols = {};
        this.symbols.map((item) => {
          const symbol = this.$el.getElementById(item.id);
          const bbox = symbol.getBBox();
          this.landscape.symbols[item.id] = {
            x: 0,
            y: 0,
            height: bbox.height + bbox.y,
            width: bbox.width + bbox.x
          };
        });
      }
    }
  };
</script>

<style scoped>

.dochub-schema {
  /* border: solid 2px #ff0000; */
  /* max-height: calc(100vh - 64px); */
  aspect-ratio: unset;
}

.wave-cell {
  stroke: #000;
  fill-opacity: 0;
}

.path-cell {
  stroke: #0000ff;
  fill-opacity: 0;
}
.wave-point {
  stroke: #00FF00;
  fill-opacity: 0;
}

.error-cell {
  fill: #f00;
  stroke: #fff;
}

</style>

<template>
  <box>
    <v-card flat class="container">
      <v-system-bar
        class="toolbar"
        floating
        flat
        color="#fff"
        dense>
        <v-btn
          icon
          title="Экспорт в Excalidraw"
          v-on:click="exportToExcalidraw">
          <v-icon>mdi-download</v-icon>
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
        v-on:playstart="onPlayStart" />
    </v-card>
  </box>
</template>

<script>

  import Schema from '@/components/Schema/DHSchema/DHSchema.vue';
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
        status: {}, // Текущий статус схемы
        selectedScenario: null,
        isPaying: false
      };
    },
    computed: {
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
        return this.source.dataset || {};
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
      // Экспорт в Excalidraw
      exportToExcalidraw() {
        this.$refs.schema.$emit('exportToExcalidraw', this.scenario);
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
  margin-top: 14px;

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

<template>
  <v-container grid-list-xl fluid style="height:100%">
    <split v-bind:direction="'vertical'">
      <split-area v-bind:size="30" class="area-space">
        <div class="console">
          <div class="statistics">
            <span class="stat-item">Время выполнения сек: {{ exposition }}</span>
          </div>
          <textarea 
            v-model="query" 
            class="area" 
            wrap="off" 
            v-on:keydown.tab.prevent="tabber($event)" />
        </div>
      </split-area>
      <split-area v-bind:size="70" class="area-space">
        <pre v-if="error" class="area" v-html="errorExplain" />
        <textarea v-else v-model="result" class="area" readonly style="background-color: #f5f5f5;" wrap="off" />
      </split-area>
    </split>
  </v-container>
</template>

<script>

  import query from '@/manifest/query';
  import cookie from 'vue-cookie';

  const COOKIE_NAME = 'json-dev-tool-query';

  export default {
    name: 'JSONataDevTool',
    data() {
      return {
        query: cookie.get(COOKIE_NAME) || '"Здесь введите JSONata запрос."',
        exposition: '--',
        result: null,
        error: null,
        observer: null
      };
    },
    computed: {
      errorExplain() {
        if (this.error) {
          const pos = this.error.position;
          return `Error: ${this.error.message}\n\n${this.query.slice(0, pos)} <span style="color:red"> ${this.query.slice(pos)} </span>`;
        }
        return null;
      }
    },
    watch: {
      query(value) {
        this.observer && clearTimeout(this.observer);
        this.observer = setTimeout(() => {
          this.execute();
          this.observer = null;
        }, 500);
        cookie.set(COOKIE_NAME, value, 365);
      }
    },
    mounted() {
      this.execute();
    },
    methods: {
      execute() {
        this.error = null;
        const jsonata = query.expression(this.query, null, null, true);
        jsonata.onError = (e) => this.error = e;
        this.result = JSON.stringify(jsonata.evaluate(this.manifest), null, 4);
        this.exposition = (jsonata.trace?.exposition || 0) * 0.001;
      },
      tabber(event) {
        if (event) {
          const originalSelectionStart = event.target.selectionStart;
          const startText = this.query.slice(0, event.target.selectionStart);
          const endText = this.query.slice(event.target.selectionStart);
          this.query = `${startText}\t${endText}`;
          event.target.value = this.query;
          event.target.selectionEnd = event.target.selectionStart = originalSelectionStart + 1;
        }
      }      
    }
  };
</script>

<style scoped>

.console {
  height: calc(100% - 12px);
}

.statistics {
  height: 24px;
  background-color: #eee;
}

.stat-item {
  color: black;
  float: left;
  font-size: 12px;
  margin-left: 12px;
  margin-top: 6px;
  margin-bottom: 6px;
}

.area-space {
  overflow: hidden;
}

.area {
  height: calc(100% - 24px);
  width: 100%;
  resize: none;
  padding: 4px;
  overflow: auto;
}

</style>

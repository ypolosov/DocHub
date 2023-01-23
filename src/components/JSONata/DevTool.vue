<template>
  <v-container class="desk" grid-list-xl fluid>
    <split v-bind:direction="'vertical'">
      <split-area v-bind:size="40" class="area-space">
        <div class="console">
          <v-toolbar dense flat>
            <v-btn icon title="Выполнить" v-on:click="execute">
              <v-icon>mdi-arrow-right-drop-circle</v-icon>
            </v-btn>
            <v-toolbar-title />
            <v-spacer />
            <v-btn icon>
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </v-toolbar>          
          <editor
            v-model="query"
            class="input" />
        </div>
      </split-area>
      <split-area v-bind:size="60" class="area-space">
        <pre v-if="error" class="output" v-html="errorExplain" />
        <div v-else class="output">
          <div class="log">
            <v-data-table
              v-bind:headers="logHeaders"
              v-bind:items="logItems"
              v-bind:search="search"
              disable-pagination
              hide-default-footer
              class="elevation-1 table">
              <template #item="{ item }">
                <tr v-bind:class="item.id === selectedLog ?'selected-log':''" v-on:click="logOnClick(item)">
                  <td>{{ item.moment }}</td>
                  <td>{{ item.tag }}</td>
                </tr>              
              </template>
            </v-data-table>
          </div>
          <result class="result" v-bind:jsoncode="result" />
          <!--
          <textarea v-model="result" class="result" readonly style="background-color: #f5f5f5;" wrap="off" />
          -->
        </div>
      </split-area>
    </split>
  </v-container>
</template>

<script>

  import query from '@/manifest/query';
  import cookie from 'vue-cookie'; 
  import editor from './JSONataEditor.vue';
  import result from './JSONResult.vue';

  const COOKIE_NAME = 'json-dev-tool-query';

  export default {
    name: 'JSONataDevTool',
    components: {
      editor,
      result
    },
    data() {
      return {
        query: cookie.get(COOKIE_NAME) || '"Здесь введите JSONata запрос."',
        error: null,
        observer: null,
        search: '',
        jsonata: null,
        selectedLog: 0,
        logHeaders: [
          {
            text: 'Таймлайн',
            align: 'start',
            value: 'moment'
          },
          {
            text: 'Тэг',
            align: 'start',
            value: 'tag'
          }
        ],
        logItems: []
      };
    },
    computed: {
      errorExplain() {
        if (this.error) {
          const pos = this.error.position;
          return `Error: ${this.error.message}\n\n${this.query.slice(0, pos)} <span style="color:red"> ${this.query.slice(pos)} </span>`;
        }
        return null;
      },
      result() {
        return this.logItems[this.selectedLog]?.value || '';
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
      logOnClick(item) {
        this.selectedLog = item.id;
      },
      log(value, tag) {
        this.logItems.push({
          id: this.logItems.length,
          moment: (((new Date()).getTime() - this.jsonata.trace?.start || 0) * 0.001).toFixed(5),
          value: JSON.parse(JSON.stringify(value)), 
          tag
        });
        return value;
      },
      execute() {
        this.error = null;
        this.logItems = [];
        this.jsonata = query.expression(this.query, null, null, true, { log: this.log});
        this.jsonata.onError = (e) => this.error = e;
        const result = JSON.stringify(this.jsonata.evaluate(this.manifest), null, 4);
        this.logItems.push({
          id: this.logItems.length,
          moment: ((this.jsonata.trace?.end - this.jsonata.trace?.start || 0) * 0.001).toFixed(5),
          tag: 'END',
          value: result
        });
        this.selectedLog = this.logItems.length - 1;
      }
    }
  };
</script>

<style>

.desk {
  position: absolute;
  bottom: 0;
  padding: 0;
  height:100%;
  max-height: 100%;
}

.console {
  height: 100%;
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

.input,
.output {
  width: 100%;
  resize: none;
  padding: 0px;
  overflow: auto;
}

.output {
  height: 100%;
}

.result {
  float: right;
  width: 70%;
  height: 100%;
  padding: 4px;
  overflow: auto;
  margin: 0 !important;
  background-color: #f5f5f5;
}

.log {
  float: left;
  width: 30%;
  height: 100%;
  max-height: 100%;
  overflow: auto;
}

.log .table {
  width: 100%;
}

.input {
  height: calc(100% - 48px);
  width: 100%;
  resize: none;
  padding: 4px;
  overflow: auto;
  border: solid 1px #eee;
}

.selected-log {
  background-color: rgb(52, 149, 219) !important;
}

</style>

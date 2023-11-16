<template>
  <v-container class="desk" grid-list-xl fluid>
    <v-toolbar dense flat dark>
      <v-spacer />
      <v-btn v-show="!autoExec" icon title="Выполнить" v-on:click="manualExec(true)">
        <v-icon>mdi-arrow-right-drop-circle</v-icon>
      </v-btn>
      <v-btn icon title="Добавить панель" v-on:click="addTab()">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-menu offset-y>
        <template #activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-checkbox
              v-model="autoExec" />
            <v-list-item-title>Автоматически выполнять запросы</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-checkbox
              v-model="autoExpand" />
            <v-list-item-title>Автоматически разворачивать ответ</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <template #extension>
        <v-tabs v-model="selectedTab" show-arrows>
          <v-tab v-for="(tab, index) in tabs" v-bind:key="tab.id">
            {{ tab.name }}
            <v-btn v-if="tabs.length >= 2" icon class="ml-2" v-on:click="delTab(index)">
              <v-icon x-small>mdi-close</v-icon>
            </v-btn>
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>
    <split v-if="tabs.length" v-bind:direction="'vertical'">
      <split-area v-bind:size="40" class="area-space">
        <!-- TODO: минимальная высота на всю split-area -->
        <code-component v-if="tabs[selectedTab]" v-model="tabs[selectedTab].code" v-bind:change="onChange" />
      </split-area>
      <split-area v-bind:size="60" class="area-space">
        <div class="responsePane">
          <!-- TODO: loader здорового человека -->
          <div v-if="tabs[selectedTab].loading">Идет загрузка</div>
          <div v-else>
            <div v-if="tabs[selectedTab].emptyData">
              {{ tabs[selectedTab].emptyData }}
            </div>
            <div v-else-if="tabs[selectedTab].unexpectedError">
              {{ tabs[selectedTab].unexpectedError }}
            </div>
            <div v-else-if="tabs[selectedTab].error">
              <response-component v-bind:data="tabs[selectedTab].error" v-bind:auto-expand="autoExpand" />
            </div>
            <div v-else>
              <!-- TODO: низкая производительность при большом объёме данных -->
              <response-component v-bind:data="tabs[selectedTab].response" v-bind:auto-expand="autoExpand" />
            </div>
          </div>
        </div>
      </split-area>
    </split>
  </v-container>
</template>

<script>
  import cookie from 'vue-cookie';
  import CodeComponent from './CodeComponent.vue';
  import ResponseComponent from './ResponseComponent.vue';
  import env from '@front/helpers/env';

  const backendFileStorageURL = env.backendFileStorageURL();

  function uuidv4() {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  function isServerFailStatus(statusCode) {
    return [403, 404, 501, 502, 503, 504].includes(statusCode);
  }

  const COOKIE_NAME_AUTOEXEC = 'json-dev-tool-new-autoexec';
  const COOKIE_NAME_AUTOEXPAND = 'json-dev-tool-new-autoexpand';
  const LOCALSTORAGE_NAME_TABS = 'json-dev-tool-new-tabs';
  const COOKIE_NAME_SELECTEDTAB = 'json-dev-tool-new-selectedtab';


  export default {
    name: 'DevTool',
    components: {CodeComponent, ResponseComponent},
    props: {
      pullData: {
        type: Function,
        required: true
      }
    },
    data() {
      return {
        selectedTab: parseInt(cookie.get(COOKIE_NAME_SELECTEDTAB) || 0),
        tabsCounter: 0,
        tabs: [],
        autoExpand: cookie.get(COOKIE_NAME_AUTOEXPAND) === 'true' ? true : false,
        autoExec: cookie.get(COOKIE_NAME_AUTOEXEC) === 'false' ? false : true
      };
    },
    watch: {
      autoExec(value) {
        value && this.exec();
        cookie.set(COOKIE_NAME_AUTOEXEC, value, 365);
      },
      autoExpand(value) {
        value && this.exec(); // FIXME: тут не нужен перезапрос, но без него не работает
        cookie.set(COOKIE_NAME_AUTOEXPAND, value, 365);
      },
      selectedTab(value) {
        cookie.set(COOKIE_NAME_SELECTEDTAB, value, 365);
      }
    },
    mounted() {
      if (localStorage.getItem(LOCALSTORAGE_NAME_TABS)) {
        try {
          this.tabs = JSON.parse(localStorage.getItem(LOCALSTORAGE_NAME_TABS));
          console.log(typeof this.tabs);
          this.tabsCounter = this.tabs.length;
          console.log(this.tabs);
          return;
        } catch(e) {
          localStorage.removeItem(LOCALSTORAGE_NAME_TABS);
        }
      }
      this.addTab();
      console.log(this.tabs);
    },
    methods: {
      // TODO: метод чтобы класть в localStorage табы, но удалять лишнее
      addTab() {
        const id = uuidv4();
        this.tabsCounter += 1;  // кол-во ключей в объекте tabs не получится использовать, т.к. при удалении-создании начнётся каша с нумерацией
        this.tabs.push({'id': id, 'name': `Панель #${this.tabsCounter}`, 'code': '', 'response': {}, 'loading': false, 'error': null, 'unexpectedError': null, 'controller': null, 'emptyData': null});
        localStorage.setItem(LOCALSTORAGE_NAME_TABS, JSON.stringify(this.tabs));
        return id;
      },
      delTab(id) {
        this.tabs.splice(id, 1);
        localStorage.setItem(LOCALSTORAGE_NAME_TABS, JSON.stringify(this.tabs));
      },
      manualExec(){
        this.exec();
      },
      async exec(){
        const currentTab = this.tabs[this.selectedTab];

        currentTab.error = null;
        currentTab.unexpectedError = null;
        currentTab.emptyData = null;

        localStorage.setItem(LOCALSTORAGE_NAME_TABS, JSON.stringify(this.tabs));

        const showEmpty = (data) => {
          currentTab.emptyData = data;
        };

        const showUnexpectedError = (data) => {
          currentTab.unexpectedError = data;
        };

        const showError = (data) => {
          currentTab.error = data;
        };

        const showSuccess = (data) => {
          currentTab.response = data;
        };

        if (currentTab.controller) {
          currentTab.controller.abort();
        }

        let request;
        currentTab.controller = new AbortController();

        currentTab.loading = true;
        try {
          request = await fetch(`${backendFileStorageURL}jsonata/(${encodeURIComponent(currentTab.code)})?params=null&subject=null`, {
            signal: currentTab.controller.signal
          });
        } catch (e) {
          if(e.name === 'AbortError') {
            return;
          }
          return showUnexpectedError(`Ошибка при обращении к API: ${e}`);
        }
        currentTab.loading = false;

        if (isServerFailStatus(request.status) ) {
          return showUnexpectedError(`Произошла ошибка на сервере: ${request.status}`);
        }

        let jsonData;
        try {
          jsonData = await request.json();
        } catch (e) {
          return showEmpty('Пустой ответ от сервера');
        }

        if (request.status === 500) {
          return showError(jsonData);
        }

        return showSuccess(jsonData);
      },

      onChange(code) {
        const currentTab = this.tabs[this.selectedTab];

        currentTab.code = code;

        if (this.autoExec){
          this.exec();
        }
      }
    }
  };
</script>

<style scoped>
  header.v-toolbar {
    height: 96px;
  }
  .split:not(.area-space){
    height: calc(100% - 96px);
    border: solid 1px #eee;
  }
</style>

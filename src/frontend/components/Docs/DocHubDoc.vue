<template>
  <div>
    <template v-if="!isReloading">
      <component 
        v-bind:is="is"
        v-if="is"
        v-bind:inline="inline"
        v-bind:params="currentParams"
        v-bind:profile="profile"
        v-bind:path="currentPath"
        v-bind:get-content="getContentForPlugin"
        v-bind:to-print="isPrintVersion"
        v-bind:pull-data="pullData"
        v-bind:context-menu="contextMenu" />
      <v-alert v-else icon="warning">
        Неизвестный тип документа [{{ docType }}]
      </v-alert>
    </template>
  </div>
</template>

<script>
  import { DocTypes } from '@front/components/Docs/enums/doc-types.enum';
  import AsyncApiComponent from '@front/components/Docs/DocAsyncApi.vue';
  import Empty from '@front/components/Controls/Empty.vue';
  import requests from '@front/helpers/requests';
  import datasets from '@front/helpers/datasets';
  import query from '@front/manifest/query';
  import uriTool from '@front/helpers/uri';

  import Swagger from './DocSwagger.vue';
  import Plantuml from './DocPlantUML.vue';
  import DocMarkdown from './DocMarkdown.vue';
  import DocTable from './DocTable.vue';
  import DocMermaid from './DocMermaid.vue';
  import DocNetwork from './DocNetwork.vue';
  import DocSmartants from './DocSmartAnts.vue';
  
  // Встроенные типы документов
  const inbuiltTypes = {
    [DocTypes.ASYNCAPI]: 'async-api-component',
    [DocTypes.OPENAPI]: 'swagger',
    [DocTypes.PLANTUML]: 'plantuml',
    [DocTypes.MARKDOWN]: 'doc-markdown',
    [DocTypes.TABLE]: 'doc-table',
    [DocTypes.MERMAID]: 'doc-mermaid',
    [DocTypes.NETWORK]: 'doc-network',
    [DocTypes.SMARTANTS]: 'doc-smartants'
  };

  
  export default {
    name: 'Document',
    components: {
      AsyncApiComponent,
      Plantuml,
      Swagger,
      DocMarkdown,
      DocTable,
      Empty,
      DocMermaid,
      DocNetwork,
      DocSmartants
    },
    props: {
      path: {
        type: String,
        default: '$URL$'
      },
      inline: { type: Boolean, default: false },
      // Параметры передающиеся в запросы документа
      // Если undefined - берутся из URL
      params: { 
        type: Object,
        default: undefined
      },
      contextMenu: {
        type: Array,
        default() {
          return [];
        }
      }
    },
    data() {
      return {
        DocTypes,
        currentPath : this.resolvePath(),
        currentParams: this.resolveParams(),
        dataProvider: datasets()
      };
    },
    asyncComputed: {
      async profile() {
        const id = `("${this.currentPath.slice(1).split('/').join('"."')}")`;
        return await query.expression(id).evaluate();
      }
    },
    computed: {
      is() {
        return inbuiltTypes[this.docType] 
          || (this.$store.state.plugins.documents[this.docType] && `plugin-doc-${this.docType}`)
          || null;
      },
      docType() {
        return (this.profile?.type || 'unknown').toLowerCase();
      },
      baseURI() {
        return uriTool.getBaseURIOfPath(this.currentPath);
        // return this.$store.state.sources[this.currentPath][0];
      },
      isReloading() {
        return this.$store.state.isReloading;
      },
      isPrintVersion() {
        return this.$store.state.isPrintVersion;
      }
    },
    watch: {
      '$route'(){
        this.currentPath = this.resolvePath();
        this.currentParams = this.resolveParams();
      }
    },
    methods: {
      resolveParams() {
        return this.params || this.$router.currentRoute.query || {};
      },  
      // Определяем текущий путь к профилю документа
      resolvePath() {
        return this.path === '$URL$' ? this.$router.history.current.path : this.path;
      },
      // Провайдер контента файлов для плагинов
      //  url - прямой или относительный URL к файлу
      getContentForPlugin(url) {
        return new Promise((success, reject) => {
          requests.request(url, this.baseURI)
            .then(success)
            .catch(reject);
        });
      },
      // API к озеру данных архитектуры
      //  expression - JSONata запрос или идентификатор ресурса
      //  self - значение переменной $self в запросе
      //  params - значение переменной $params в запросе
      //  context - контекст запроса (по умолчанию равен manifest)
      pullData(expression, self_, params, context) {
        if (!expression) {
          return datasets.releaseData(this.currentPath, params);
        } else
          return query.expression(expression || this.profile?.source, self_, params).evaluate(context);
      }
    }
  };
</script>

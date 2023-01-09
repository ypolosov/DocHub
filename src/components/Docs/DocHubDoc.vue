<template>
  <div>
    <component 
      v-bind:is="is"
      v-if="is"
      v-bind:inline="inline"
      v-bind:params="params"
      v-bind:profile="profile"
      v-bind:path="currentPath"
      v-bind:get-content="getContentForPlugin"
      v-bind:pull-data="pullData" />
    <v-alert v-else icon="warning">
      Неизвестный тип документа [{{ docType }}]
    </v-alert>      
  </div>
</template>

<script>
  import { DocTypes } from '@/components/Docs/enums/doc-types.enum';
  import Swagger from './DocSwagger.vue';
  import AsyncApiComponent from '@/components/Docs/DocAsyncApi.vue';
  import Plantuml from './DocPlantUML.vue';
  import DocMarkdown from './DocMarkdown.vue';
  import DocTable from './DocTable.vue';
  import DocMermaid from './DocMermaid.vue';
  import DocNetwork from './DocNetwork.vue';
  import Empty from '../Controls/Empty.vue';
  import requests from '@/helpers/requests';
  // import query from '@/manifest/query';
  import datasets from '@/helpers/datasets';

  // Встроенные типы документов
  const inbuiltTypes = {
    [DocTypes.ASYNCAPI]: 'async-api-component',
    [DocTypes.OPENAPI]: 'swagger',
    [DocTypes.PLANTUML]: 'plantuml',
    [DocTypes.MARKDOWN]: 'doc-markdown',
    [DocTypes.TABLE]: 'doc-table',
    [DocTypes.MERMAID]: 'doc-mermaid',
    [DocTypes.NETWORK]: 'doc-network'
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
      DocNetwork
    },
    props: {
      path: {
        type: String,
        default: '$URL$'
      },
      inline: { type: Boolean, default: false },
      // Параметры передающиеся в запросы документа
      params: { 
        type: Object, 
        default() {
          return this.$router.query || {};
        }
      }
    },
    data() {
      const dataProvider = datasets();
      dataProvider.dsResolver = (id) => ({
        subject: Object.assign({'_id': id}, (this.manifest.datasets || {})[id])
      });
      return {
        DocTypes,
        currentPath : this.resolvePath(),
        dataProvider
      };
    },
    computed: {
      is() {
        return inbuiltTypes[this.docType] 
          || (this.$store.state.plugins.documents[this.docType] && `plugin-doc-${this.docType}`)
          || null;
      },
      profile() {
        const nodes = this.currentPath.split('/');
        let result = this.manifest;
        for (let i = 1; result && i < nodes.length; i++) {
          result = result[nodes[i]];
        }
        return result;
      },
      docType() {
        return (this.profile?.type || 'unknown').toLowerCase();
      }
    },
    watch: {
      '$route'(){
        this.currentPath = this.resolvePath();
      }
    },
    methods: {
      // Определяем текущий путь к профилю документа
      resolvePath() {
        return this.path === '$URL$' ? this.$router.history.current.fullPath : this.path;
      },
      // Провайдер контента файлов для плагинов
      //  url - прямой или относительный URL к файлу
      getContentForPlugin(url) {
        return new Promise((success, reject) => {
          const baseURI = this.$store.state.sources[this.currentPath][0];
          requests.request(url, baseURI)
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
        const dataProvider = datasets();
        dataProvider.dsResolver = (id) => ({
          subject: Object.assign({'_id': id}, (this.manifest.datasets || {})[id])
        });

        const subject = Object.assign(JSON.parse(JSON.stringify(self_ || this.profile || {})), expression ? { source : expression } : {});
        return dataProvider.getData(context || this.manifest, subject, params || this.params);
        /*
        return new Promise((success, reject) => {
          try {
            const request = query.expression(expression, self_, params);
            success(request.evaluate(context || this.manifest));
          } catch(e) {
            // eslint-disable-next-line no-console
            console.error(`Ошибка в запросе плагина ${this.docType}`, e);
            reject(e);
          }
        });
        */
      }

    }
  };
</script>

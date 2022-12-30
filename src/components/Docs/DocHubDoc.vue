<template>
  <div>
    <template v-if="isCorrectType === 'inline'">
      <async-api-component 
        v-if="docType === DocTypes.ASYNCAPI" 
        v-bind:params="params" 
        v-bind:path="currentPath" />
      <swagger 
        v-if="docType === DocTypes.OPENAPI"
        v-bind:params="params" 
        v-bind:path="currentPath" />
      <plantuml
        v-if="docType === DocTypes.PLANTUML"
        v-bind:params="params" 
        v-bind:path="currentPath" />
      <doc-markdown 
        v-if="docType === DocTypes.MARKDOWN"
        v-bind:params="params" 
        v-bind:path="currentPath" />
      <doc-table
        v-if="docType === DocTypes.TABLE"
        v-bind:params="params" 
        v-bind:path="currentPath" />
      <doc-mermaid
        v-if="docType === DocTypes.MERMAID"
        v-bind:params="params" 
        v-bind:path="currentPath" />
      <doc-network
        v-if="docType === DocTypes.NETWORK"
        v-bind:params="params" 
        v-bind:path="currentPath" />
    </template>
    <component 
      v-bind:is="pluginComponent"
      v-if="isCorrectType === 'plugin'"
      v-bind:profile="profile"
      v-bind:path="currentPath"
      v-bind:get-content="getContentForPlugin" />
    <v-alert v-if="isCorrectType === false" icon="warning">
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
      return {
        DocTypes,
        currentPath : this.resolvePath()
      };
    },
    computed: {
      pluginComponent() {
        return `plugin-doc-${this.docType}`;
      },
      isCorrectType() {
        for(const key in DocTypes) {
          if (DocTypes[key] === this.docType) return 'inline';
        }
        if (this.$store.state.plugins.documents[this.docType]) return 'plugin';
        return false;
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
      getContentForPlugin(url) {
        return new Promise((success, reject) => {
          const baseURI = this.$store.state.sources[this.currentPath][0];
          requests.request(url, baseURI)
            .then(success)
            .catch(reject);
        });
      }
    }
  };
</script>

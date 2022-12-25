<template>
  <div>
    <empty v-if="isEmpty" />
    <div v-else>
      <template v-if="isCorrectType === 'inline'">
        <async-api-component 
          v-if="docType === DocTypes.ASYNCAPI" 
          v-bind:document="document" 
          v-bind:params="params" 
          v-bind:profile-resolver="profileResolver" 
          v-bind:url-resolver="urlResolver" />
        <swagger 
          v-if="docType === DocTypes.OPENAPI"
          v-bind:document="document"
          v-bind:params="params" 
          v-bind:profile-resolver="profileResolver" 
          v-bind:url-resolver="urlResolver" />
        <plantuml
          v-if="docType === DocTypes.PLANTUML"
          v-bind:document="document"
          v-bind:params="params" 
          v-bind:profile-resolver="profileResolver" 
          v-bind:url-resolver="urlResolver" />
        <doc-markdown 
          v-if="docType === DocTypes.MARKDOWN"
          v-bind:document="document" 
          v-bind:params="params" 
          v-bind:profile-resolver="profileResolver" 
          v-bind:url-resolver="urlResolver" 
          v-bind:toc-show="!inline" />
        <doc-table
          v-if="docType === DocTypes.TABLE"
          v-bind:document="document" 
          v-bind:params="params" 
          v-bind:profile-resolver="profileResolver" 
          v-bind:url-resolver="urlResolver" />
        <doc-mermaid
          v-if="docType === DocTypes.MERMAID"
          v-bind:document="document" 
          v-bind:params="params" 
          v-bind:profile-resolver="profileResolver" 
          v-bind:url-resolver="urlResolver" />
        <doc-network
          v-if="docType === DocTypes.NETWORK"
          v-bind:document="document" 
          v-bind:params="params" 
          v-bind:profile-resolver="profileResolver" 
          v-bind:url-resolver="urlResolver" />
      </template>
      <component 
        v-bind:is="pluginComponent"
        v-if="isCorrectType === 'plugin'"
        v-bind:profile="profile"
        v-bind:get-content="getContentForPlugin" />
      <v-alert v-if="isCorrectType === false" icon="warning">
        Неизвестный тип документа [{{ docType }}]
      </v-alert>      
    </div>
  </div>
</template>

<script>
  import docs from '@/helpers/docs';
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
      document: { type: String, default: '' },
      inline: { type: Boolean, default: false },
      // Формирование профиля документа
      profileResolver: { 
        type: Function,
        default: function() {
          return this.manifest?.docs?.[this.document] || {};
        }
      },
      // Определение размещения объекта
      urlResolver: { 
        type: Function,
        default() {
          let result = this.profile ?
            docs.urlFromProfile(this.profile, 
                                (this.$store.state.sources.find((item) => item.path === `/docs/${this.document}`) || {}).location
            ): '';
          result += result.indexOf('?') > 0 ? '&' : '?';
          result += `id=${this.document}`;
          return result;
        }
      },
      // Параметры передающиеся в запросы документа
      params: { 
        type: Object, 
        default() {
          return this.$router.query;
        }
      }
    },
    data() {
      return {
        DocTypes
      };
    },
    computed: {
      pluginComponent() {
        return `plugin-doc-${this.docType}`;
      },
      profile() {
        const result = this.profileResolver();
        return result;
      },
      isEmpty() {
        return !this.profile || !this.profile.type || (this.isCorrectType === false && !this.$store.state.plugins.ready);
      },
      info() {
        return this.$store.state.plugins.documents[this.docType];
      },
      isCorrectType() {
        for(const key in DocTypes) {
          if (DocTypes[key] === this.docType) return 'inline';
        }
        if (this.$store.state.plugins.documents[this.docType]) return 'plugin';
        return false;
      },
      docType() {
        return (this.profile.type || 'unknown').toLowerCase();
      }
    },
    methods: {
      baseURI() {
        return (this.$store.state.sources.find((item) => item.path === `/docs/${this.document}`) || {}).location;
      },
      // Провайдер данных для плагинов
      getContentForPlugin(url) {
        return new Promise((success, reject) => {
          requests.request(url, this.baseURI())
            .then(success)
            .catch(reject);
        });
      }
    }
  };
</script>

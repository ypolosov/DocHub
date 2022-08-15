<template>
  <div>
    <empty v-if="isEmpty" />
    <template v-else>
      <swagger v-if="isContract" v-bind:document="document" />
      <plantuml v-if="isPlantUML" v-bind:document="document" />
      <doc-markdown v-if="isMarkdown" v-bind:document="document" />
      <doc-table v-if="isTable" v-bind:document="document" />
    </template>
  </div>
</template>

<script>

  import Swagger from './DocSwagger';
  import Plantuml from './DocPlantUML';
  import DocMarkdown from './DocMarkdown';
  import DocTable from './DocTable.vue';
  import Empty from '../Controls/Empty.vue';

  export default {
    name: 'Document',
    components: {
      Plantuml,
      Swagger,
      DocMarkdown,
      DocTable,
      Empty
    },
    props: {
      document: { type: String, default: '' }
    },
    data() {
      return {};
    },
    computed: {
      isEmpty() {
        return !this.docs[this.document];
      },
      docs() {
        return (this.manifest).docs || {};
      },
      docType() {
        return ((this.docs[this.document] || {}).type || 'unknown').toLowerCase();
      },
      isContract() {
        return this.docType === 'openapi';
      },
      isPlantUML() {
        return this.docType === 'plantuml';
      },
      isMarkdown() {
        return this.docType === 'markdown';
      },
      isTable() {
        return this.docType === 'table';
      }
    },
    mounted() {
    },
    methods: {
    }
  };
</script>

<style>

</style>

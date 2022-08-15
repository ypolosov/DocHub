<template>
  <div>
    <empty v-if="isEmpty"></empty>
    <template v-else>
      <swagger v-if="isContract" :document="document"></swagger>
      <plantuml v-if="isPlantUML" :document="document"></plantuml>
      <doc-markdown v-if="isMarkdown" :document="document"></doc-markdown>
      <doc-table v-if="isTable" :document="document"></doc-table>
    </template>
  </div>
</template>

<script>

import Swagger from "./DocSwagger";
import Plantuml from "./DocPlantUML";
import DocMarkdown from "./DocMarkdown";
import DocTable from "./DocTable.vue"
import Empty from '../Controls/Empty.vue'

export default {
  name: 'document',
  components: {
    Plantuml,
    Swagger,
    DocMarkdown,
    DocTable,
    Empty
  },
  mounted() {
  },
  methods: {
  },
  computed: {
    isEmpty() {
      return !this.docs[this.document];
    },
    docs() {
      return (this.manifest).docs || {};
    },
    docType () {
      return ((this.docs[this.document] || {}).type || 'unknown').toLowerCase();
    },
    isContract() {
      return this.docType === 'openapi';
    },
    isPlantUML() {
      return this.docType === 'plantuml';
    },
    isMarkdown () {
      return this.docType === 'markdown';
    },
    isTable () {
      return this.docType === 'table';
    }
  },
  props: {
    document: String
  },
  data() {
    return {};
  }
};
</script>

<style>

</style>

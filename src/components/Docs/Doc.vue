<template>
  <div>
    <swagger v-if="isContract" :document="document"></swagger>
    <plantuml v-if="isPlantUML"  :document="document"></plantuml>
    <doc-markdown v-if="isMarkdown"  :document="document"></doc-markdown>
  </div>
</template>

<script>

import Swagger from "./DocSwagger";
import Plantuml from "./DocPlantUML";
import manifest_parser from "../../manifest/manifest_parser";
import DocMarkdown from "./DocMarkdown";

export default {
  name: 'Doc',
  components: {
    Plantuml,
    Swagger,
    DocMarkdown
  },
  mounted() {
  },
  methods: {
  },
  computed: {
    docs() {
      return (this.$store.state.manifest[manifest_parser.MODE_AS_IS] || {}).docs || {};
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

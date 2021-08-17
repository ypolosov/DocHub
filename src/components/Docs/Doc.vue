<template>
  <div>
    <swagger v-if="isContract" :document="document"></swagger>
    <plantuml v-if="isPlantUML"  :document="document"></plantuml>
  </div>
</template>

<script>

import Swagger from "./DocSwagger";
import Plantuml from "./DocPlantUML";
import manifest_parser from "../../manifest/manifest_parser";

export default {
  name: 'Doc',
  components: {
    Plantuml,
    Swagger
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

<template>
    <div 
      style="min-height:100%; position:relative"
    >
      <plantuml 
        v-if="isCustomUML && customUML" 
        :uml="customUML"
      ></plantuml>
      <schema 
        style="position: absolute; bottom: 0; right: 0; left:0; top: 0;"
        v-else
        :schema="schema"
      ></schema>
    </div>
</template>

<script>
import Schema from '../Schema/Schema';
import manifest_parser from "../../manifest/manifest_parser";
import query from "../../manifest/query";
import Plantuml from "../Schema/PlantUML";
import requests from "../../helpers/requests";

export default {
  name: 'Context',
  components: {
    Schema,
    Plantuml
  },
  methods : {
    reloadCustomUML () {
      if (!this.isCustomUML) return;
      const basePath = (this.$store.state.sources.find((item) => item.path === `/contexts/${this.context}`) || {}).location;
      requests.request(this.schema.uml, basePath)
        .then((response) => {
          this.customUML = response.data
        }).catch((err) => {
        // eslint-disable-next-line no-console
          console.error(err);
        })
    }
  },
  computed: {
    manifest() {
      return this.$store.state.manifest[manifest_parser.MODE_AS_IS] || {};
    },
    basePath() {
      return (this.$store.state.sources.find((item) => item.path === `/contexts/${this.context}`) || {}).location;
    },
    schema () {
      const asIs = this.$store.state.manifest[manifest_parser.MODE_AS_IS];
      this.$nextTick(this.reloadCustomUML);
      const result = query.expression(query.context(this.context, this.location)).evaluate(asIs);
      return result;
    },
    isCustomUML () {
      return typeof this.schema.uml === 'string';
    }
  },
  props: {
    context: String
  },
  data() {
    return {
      customUML: null
    };
  }
};
</script>

<style scoped>

</style>

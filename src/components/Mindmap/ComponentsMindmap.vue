<template>
  <plantuml :uml = "uml"></plantuml>
</template>

<script>

import PlantUML from "../Schema/PlantUML";
import query from "../../manifest/query";
import jsonata from 'jsonata';
import manifest_parser from "../../manifest/manifest_parser";

export default {
  name: 'ComponentsMindMap',
  components: {
    "plantuml" : PlantUML
  },
  mounted() {
  },
  methods: {
  },
  props: {
    root: String, // Корневой идентификатор
    links: {
      type: String,
      default: 'smart',
      validator: value => [
        'smart',
        'component',
        'context'
      ].indexOf(value) >= 0
    }
  },
  computed: {
    uml () {
      const asis = this.$store.state.manifest[manifest_parser.MODE_AS_IS] || {};
      const nodes = jsonata(query.archMindMapComponents(this.root)).evaluate(asis);
      const namespaces = asis.namespaces || {};
      const contexts = asis.contexts || {};
      const components = asis.components || {};
      let uml = '@startwbs\n* Архитектура\n';
      let prevStruct = [];
      nodes && nodes.map((node) => {
        uml += '**'
        let nsid = '';
        const makeTitle = (id, title) => {
          if ((['smart', 'context'].indexOf(this.links) >= 0) && contexts[id]) {
            return ` [[/architect/contexts/${id} ${title}]]\n`;
          } else if ((['smart', 'component'].indexOf(this.links) >= 0) && components[id]) {
            return ` [[/architect/components/${id} ${title}]]\n`;
          } else {
            return ` ${title}\n`;
          }
        };
        const struct = node.id.split('.');
        for (let i = 0; i < struct.length; i++) {
          if (prevStruct[i] === struct[i]) uml += '*';
          else if (i === struct.length - 1) {
            uml += makeTitle(node.id, node.title);
          } else {
            const id = `${nsid}${struct[i]}`;
            uml += makeTitle(id, (namespaces[id] || {}).title || '...');
            for (let f = 0; f <= i + 2; f++) uml += '*';
          }
          nsid += `${struct[i]}.`;
        }
        prevStruct = struct;
      });
      uml += '@endwbs\n';
      // eslint-disable-next-line no-console
      console.info(uml);
      return uml;
    }
  },
  data() {
    return {
    };
  }
};
</script>

<style scoped>


</style>

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
  computed: {
    uml () {
      const asis = this.$store.state.manifest[manifest_parser.MODE_AS_IS] || {};
      const nodes = jsonata(query.archMindMapComponents()).evaluate(asis);
      const namespaces = asis.namespaces || {};
      let uml = '@startwbs\n* Архитектура\n';
      let prevStruct = [];
      nodes && nodes.map((node) => {
        uml += '**'
        let nsid = '';
        const struct = node.id.split('.');
        for (let i = 0; i < struct.length; i++) {
          if (prevStruct[i] === struct[i]) uml += '*';
          else if (i === struct.length - 1) {
            uml += ` [[/architect/components/${node.id} ${node.title}]]\n`;
          } else {
            uml += ` ${(namespaces[`${nsid}${struct[i]}`] || {}).title || '...'}\n**`;
            for (let f = 0; f <= i; f++) uml += '*';
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

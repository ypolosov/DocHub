<template>
  <plantuml :uml = "uml" style="min-height:100%"></plantuml>
</template>

<script>

import PlantUML from "../Schema/PlantUML";
import query from "../../manifest/query";
import manifest_parser from "../../manifest/manifest_parser";

export default {
  name: 'GoalsMindMap',
  components: {
    "plantuml" : PlantUML
  },
  mounted() {
  },
  methods: {
  },
  props: {
    root: String // Корневой идентификатор
  },
  computed: {
    uml () {
      const asis = this.$store.state.manifest[manifest_parser.MODE_AS_IS] || {};
      const nodes = query.expression(query.archMindMapGoals(this.root)).evaluate(asis);
      let uml = '@startwbs\n* Цели\n';

      const appendNode = (before, current, title) => {
        let deep = '**';
        let isPrefix = true;
        const beforeStruct = before.split('.');
        const curentStruct = current.split('.');
        for (let i = 0; i < curentStruct.length; i++) {
          isPrefix = isPrefix && (beforeStruct[i] === curentStruct[i]);
          if (!isPrefix) {
            if (i === curentStruct.length - 1) {
              uml += `${deep} [[/architect/goals/${current} ${title}]]`
            } else {
              const goalID = curentStruct.slice(0, i + 1).join('.');
              const goal = asis.goals && asis.goals[goalID];
              const title = (goal && goal.title) || curentStruct[i];
              uml += `${deep} [[/architect/goals/${goalID} ${title}]]\n`;
            }
          }
          deep += '*';
        }
        uml += '\n';
      }

      let before = '';
      nodes && nodes.map((node) => {
        appendNode(before, node.id, node.title);
        before = node.id;
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

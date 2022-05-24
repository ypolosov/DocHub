<template>
  <plantuml :uml = "uml" style="min-height:100%"></plantuml>
</template>

<script>

import PlantUML from "../Schema/PlantUML";
import query from "../../manifest/query";
import manifest_parser from "../../manifest/manifest_parser";
import datetime from "../../helpers/datetime"

export default {
  name: 'TransformGantt',
  components: {
    "plantuml" : PlantUML
  },
  mounted() {
  },
  methods: {
  },
  props: {
    // root: String // Корневой идентификатор
  },
  computed: {
    manifest () {
      return this.$store.state.manifest[manifest_parser.MODE_AS_IS] || {};
    },

    transforms () {
      return query.expression(query.archGanttTransforms()).evaluate(this.manifest);
    },

    gantt () {
      const gantt = {};
      const goals = this.manifest.goals;

      // Инициалдизуем цели
      for (const goalID in goals) {
        gantt[goalID] = { 
          title: goals[goalID].title || goalID,
          transforms : {}
        }
      }

      // Разбираем трансформации
      (this.transforms || []).map((transform) => {
        // Заполняем структуру целей, если они упущены
        (transform.goals || []).map((goalID) => {
          if (!gantt[goalID]) {
            const goal = this.manifest.goals[goalID] || { title: goalID,  transforms : {}};
            gantt[goalID] = {
              title: goal.title,
              transforms: {}
            }
          }
          // Наполняем цели трансформациями
          let curr = gantt[goalID];
          let currID;
          transform.id.split('.').map((partID) => {
            currID = currID ? `${currID}.${partID}` : partID;
            if (!curr.transforms[partID]) {
              const clone = JSON.parse(JSON.stringify((this.manifest.transforms || {})[currID] || {}));
              clone.id = `${goalID}.${currID}`;
              clone.title = clone.title || partID;
              clone.start = new Date(clone.start || Date.now());
              clone.end = new Date(clone.end || Date.now());
              clone.transforms = {};
              curr.transforms[partID] = clone;
            }
            const start = new Date(transform.start || Date.now());
            const end = new Date(transform.end  || Date.now());
            if (curr.start > start) curr.start = start;
            if (curr.end < end) curr.end = end;
            curr = curr.transforms[partID];
          });
        });
      });

      // eslint-disable-next-line no-console
      console.info(gantt);

      return gantt;
    },

    uml () {
      let uml = '';

      let projectStart = null;

      const renderTransforms = (transforms) => {
        for (const transformID in transforms) {
          const transform = transforms[transformID];
          const start = datetime.getPUMLDate(transform.start);
          if (!projectStart || projectStart > transform.start) projectStart = transform.start;
          const end = datetime.getPUMLDate(transform.end);
          uml += `[${transform.title}] as [${transform.id}] starts ${start}\n`;
          uml += `[${transform.id}] ends ${end}\n`;
          renderTransforms(transform.transforms);
        }
      };

      for (const goalID in this.gantt) {
        const goal = this.gantt[goalID];
        const title = "".padStart(goalID.split(".").length - 1, ">") + " " + goal.title;
        uml += `-- [[${window.origin}/architect/goals/${goalID} ${title}]] --\n\n`;
        renderTransforms(goal.transforms);
      }
      /*
      (this.gantt || []).map((goal) => {
        uml += `-- ${} --\n`;
        uml += `[${item.title}] as [${item.id}]`;
        item.start && (uml += ` starts ${item.start}`);
        item.end && (uml += ` ends ${item.end}`);
        uml += '\n';
      });
      */
      uml = '@startgantt\n'
        + '<style>\nseparator {\nFontSize 16\nFontStyle bold\n}\n</style>\n'
        + 'language ru\ntitle Трансформации\n'
        + `Project starts ${datetime.getPUMLDate(projectStart || new Date())}\n`
        + 'printscale weekly\n'
        + uml
        + '\n@endgantt\n';
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

<template>
  <div>
    <gantt-elastic :tasks="tasks" :options="options">
      <gantt-elastic-header slot="header"></gantt-elastic-header>
      <gantt-elastic-footer slot="footer"></gantt-elastic-footer>
    </gantt-elastic>
  </div>
  
</template>

<script>

import query from "../../manifest/query";
import manifest_parser from "../../manifest/manifest_parser";
import datetime from "../../helpers/datetime"
import GanttElastic from "gantt-vue";

export default {
  name: 'TransformGantt',
  components: {
    ganttElasticHeader: {template:`<span></span>`},
    GanttElastic,
    ganttElasticFooter: {template:`<span></span>`}
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

    tasks () {
      const tree = {
        transforms: {}
      };
      // Разбираем трансформации
      // создаем единое дерево с целями
      (this.transforms || []).map((transform) => {
          // Наполняем цели трансформациями
          let currID;
          let curr = tree;
          transform.id.split('.').map((partID) => {
            currID = currID ? `${currID}.${partID}` : partID;
            if (!curr.transforms[partID]) {
              const clone = JSON.parse(JSON.stringify((this.manifest.transforms || {})[currID] || {}));
              clone.id = currID;
              clone.label = clone.title || partID;
              clone.start = new Date(clone.start || Date.now());
              clone.end = new Date(clone.end || Date.now());
              clone.type = 'task';
              clone.transforms = {};
              curr.transforms[partID] = clone;
            }
            curr = curr.transforms[partID];
          });
      });

      // Разворачиваем дерево трансформаций в ганта
      const tasks = [];
      const expandTransforms = (node) => {
        let start = null
        let end = null;
        for (const transformID in node.transforms) {
          const transform = node.transforms[transformID];
          transform.parentId = node.id;
          const subRange = expandTransforms(transform);
          if (subRange.start && (transform.start > subRange.start)) transform.start = subRange.start;
          if (subRange.end && (transform.end < subRange.end)) transform.end = subRange.end;
          if (!start || (start > transform.start)) start = transform.start;
          if (!end || (end < transform.end)) end = transform.end;
          transform.start = transform.start.getTime();
          transform.end = transform.end.getTime();
          transform.duration = transform.end - transform.start;
          transform.style = {
            base : {
              fill: 'rgb(52, 149, 219)',
              stroke: 'rgb(52, 149, 219)'
            }
          };
          tasks.push(transform);
        }
        return { start, end };
      };
      expandTransforms(tree);

      // eslint-disable-next-line no-console
      console.info(tasks);

      return tasks;
    },
  },
  data() {
    return {
      options: {
        maxRows: 100,
        maxHeight: 300,
        title: {
          label: 'Your project title as html (link or whatever...)',
          html: false
        },
        row: {
          height: 24
        },
        calendar: {
          hour: {
            display: false
          }
        },
        chart: {
          progress: {
            bar: false
          },
          expander: {
            display: true
          }
        },
        taskList: {
          expander: {
            straight: false
          },
          columns: [
            {
              id: 1,
              label: 'Название',
              value: 'label',
              width: 200,
              expander: true
            },
            {
              id: 2,
              label: 'Начало',
              value: task => datetime.getPUMLDate(new Date(task.start)),
              width: 78
            },
            {
              id: 3,
              label: 'Конец',
              value: task => datetime.getPUMLDate(new Date(task.end)),
              width: 78
            }
          ]
        },
        locale:{
          name: 'ru', // name String
          weekdays: ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресение"],
          weekdaysShort: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
          weekdaysMin: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"], 
          months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
          monthsShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
          ordinal: n => `${n}`, // ordinal Function (number) => return number + output
          relativeTime: { // relative time format strings, keep %s %d as the same
            future: 'после %s', // e.g. in 2 hours, %s been replaced with 2hours
            past: 'до %s',
            s: 'kilka sekund',
            m: 'минута',
            mm: '%d минут',
            h: 'час',
            hh: '%d часов', 
            d: 'день',
            dd: '%d дней',
            M: 'месяц',
            MM: '%d месяцев',
            y: 'год',
            yy: '%d лет'
          }
       }
      }
    };
  }
};
</script>

<style scoped>
</style>

<template>
    <v-card class="card-item">
      <v-card-title>
        <v-icon left style="color:#f00">report_problem</v-icon>
        <span class="title">Валидаторы</span>
      </v-card-title>
      <v-card-text class="headline font-weight-bold">
        <v-btn-toggle v-model="filter" class="toggle-filter">
          <v-btn value="all">
            Все
          </v-btn>
          <v-btn value="problems">
            Отклонения
          </v-btn>
          <v-btn value="exceptions">
            Исключения
          </v-btn>
        </v-btn-toggle>
        <tree :items="items" style="overflow-x: auto" v-model="subject"></tree>
      </v-card-text>
    </v-card>
</template>

<script>

import Tree from "../../Controls/Tree.vue";
import Mixin from "../mixin"

export default {
  name: 'Validators',
  mixins: [Mixin],
  components: {
    Tree
  },
  computed: {
    items () {
      const result = [];
      // Строим дерево валидаторов
      const expandItem = (expitem) => {
        let node = result;
        const stack = [];
        // Разбираем ключ
        expitem.id.split('.').map((partKey, index, arr) => {
          const key = arr.slice(0, index + 1).join('.');
          let item = node.find((element) => element.key === key)
          if (!item) {
            node.push(
                item = {
                  title: partKey,
                  key,
                  items: [],
                  parent: node,
                  count: 0
                }
            );
          }
          stack.push(item);
          if (arr.length - 1 === index) {
            item.link = expitem.link;
            item.title = expitem.title || partKey;
          }
          node = item.items;
        });
        // Разбираем отклонения
        (expitem.items || []).map((item) => {
          const problem = {
            title: item.uid,
            key: item.uid,
            icon: 'error',
            iconStyle: 'color:#F00',
            items: [],
            link: `/problems/${item.uid}`,
            selected: this.subject === item.uid
          };

          if(this.exceptions[item.uid]) {
            problem.icon = 'warning';
            problem.iconStyle = 'color:#FF6F00';
          } 

          if (
              (this.filter === 'problems' && problem.icon !== 'error')
              || (this.filter === 'exceptions' && problem.icon !== 'warning')
            ) return;

          // Если отклонение выбрано (как параметр в URL) открываем дерево до него
          problem.selected && stack.forEach((item) => item.expand = true);

          node.push(problem);
        });
        // Всегда раскрываем первый уровень дерева
        stack[0].expand = true; 
        // Обходим дерево до корня
        stack.forEach((item) => { 
          // Индексируем счетчики проблем
          item.count += node.length; 
        });
      }
      this.problems.map((item) => expandItem(item));

      // Сортируем дерево отклонений
      const sort = (items) => {
        items.sort((item1, item2) => {
          if (!item1.items.length && item2.items.length > 0) return 1;
          else if (item1.items.length > 0 && !item2.items.length) return -1;
          else if (item1.icon === 'error' && item2.icon === 'warning') return -1;
          else if (item2.icon === 'error' && item1.icon === 'warning') return 1;
          return 0;
        });
        items.map((item) => item.items.length && sort(item.items));
      };
      sort(result);

      return result;
    }    
  },
  props: {
    subject: String
  },
  data() {
    return {
      filter: 'problems'
    };
  }
};
</script>

<style scoped>
  .card-item {
    width: 100%;
    margin-top: 12px;
  }

  .source-list-item {
    font-stretch: normal;
    font-size: 16px;
    font-weight: 300;
  }

  .toggle-filter * {
    height: 24px !important;
  }
</style>

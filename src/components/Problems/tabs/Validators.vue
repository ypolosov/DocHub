<template>
    <v-card class="card-item">
      <v-card-title>
        <v-icon left style="color:#f00">error</v-icon>
        <span class="title">Валидаторы</span>
      </v-card-title>
      <v-card-text class="headline font-weight-bold">
        <tree :items="items" style="overflow-x: auto" v-model="subject"></tree>
      </v-card-text>
    </v-card>
</template>

<script>

import Tree from "../../Controls/Tree.vue";

export default {
  name: 'Validators',
  components: {
    Tree
  },
  computed: {
    problems() {
      return this.$store.state.problems || [];
    },
    items () {
      const result = [];
      const stack = [];
      // Строим дерево валидаторов
      const expandItem = (expitem) => {
        let node = result;
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
            items: [],
            link: `/problems/${item.uid}`,
            selected: this.subject === item.uid
          };

          // Если отклонение выбрано (как параметр в URL) открываем дерево до него
          if (problem.selected) {
            stack.forEach((item) => item.expand = true);
          }

          node.push(problem);
        });
      }
      this.problems.map((item) => expandItem(item));

      // Сортируем дерево отклонений
      const sort = (items) => {
        items.sort((item1, item2) => {
          if (!item1.items.length && item2.items.length > 0) return 1;
          else if (item1.items.length > 0 && !item2.items.length) return -1;
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
    return {};
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
</style>

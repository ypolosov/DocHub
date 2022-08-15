<template>
    <v-card class="card-item" v-if="items.length">
      <v-card-title>
        <v-icon left>description</v-icon>
        <span class="title">Документы</span>
      </v-card-title>
      <v-card-text class="headline font-weight-bold">
        <tree :items="items" style="overflow-x: auto"></tree>
      </v-card-text>
    </v-card>
</template>

<script>

import Tree from "../../Controls/Tree.vue";
import jsonata from "jsonata";
import query from "../../../manifest/query";

export default {
  name: 'Docs',
  components: {
    Tree
  },
  computed: {
    items () {
      let counter = 0;
      const result = [];
      const expandItem = (expitem) => {
        let node = result;
        expitem.location.split('/').map((title, index, arr) => {
          let item = node.find((element) => element.title === title)
          if (!item) {
            node.push(
                item = {
                  title: title,
                  key: `${title}_${counter++}`,
                  items: []
                }
            );
          }
          if (arr.length - 1 === index) {
            item.link = expitem.link;
          }
          node = item.items;
        });
      }
      const docs =
          (jsonata(query.docsForSubject(this.subject))
              .evaluate(this.manifest) || []);
      docs.map((item) => expandItem(item));
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

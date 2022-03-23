<template>
  <tree :items="items" style="overflow-x: auto"></tree>
</template>

<script>

import Tree from "../Controls/Tree";
import jsonata from "jsonata";
import query from "../../manifest/query";
import manifest_parser from "../../manifest/manifest_parser";

export default {
  name: 'DocsTree',
  components: {
    Tree
  },
  methods: {
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
          (jsonata(query.docsForEntity(this.entity))
              .evaluate(this.$store.state.manifest[manifest_parser.MODE_AS_IS]) || []);
      docs.map((item) => expandItem(item));
      return result;
    }
  },
  props: {
    entity: String
  },
  data() {
    return {
    };
  }
};
</script>

<style>

</style>

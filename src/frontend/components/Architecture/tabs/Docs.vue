<template>
  <v-card v-if="items?.length" class="card-item">
    <v-card-title>
      <v-icon left>description</v-icon>
      <span class="title">Документы</span>
    </v-card-title>
    <v-card-text class="headline font-weight-bold">
      <tree v-bind:items="items" style="overflow-x: auto" />
    </v-card-text>
  </v-card>
</template>

<script>
  import Tree from '@front/components/Controls/Tree.vue';
  import query from '@front/manifest/query';

  export default {
    name: 'Docs',
    components: {
      Tree
    },
    props: {
      subject: { type: String, default: '' }
    },
    data() {
      return {};
    },
    asyncComputed: {
      async items() {
        let counter = 0;
        const result = [];
        const expandItem = (expitem) => {
          let node = result;
          expitem.location.split('/').map((title, index, arr) => {
            let item = node.find((element) => element.title === title);
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
        };
        const docs = await query.expression(query.docsForSubject(this.subject)).evaluate() || [];
        docs.map((item) => expandItem(item));
        return result;
      }    
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

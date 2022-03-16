<template>
  <v-data-table
    :headers="headers"
    :items="dataset || []"
    class="elevation-1"
  >
    <template v-slot:items="props" v-if="manifest">
      <td>[{{ dataset }}]</td>
      <td class="text-xs-right">----123</td>
      <td class="text-xs-right">{{ props.item.fat }}</td>
      <td class="text-xs-right">{{ props.item.carbs }}</td>
      <td class="text-xs-right">{{ props.item.protein }}</td>
      <td class="text-xs-right">{{ props.item.iron }}</td>
    </template>
  </v-data-table>
</template>

<script>

import manifest_parser from "../../manifest/manifest_parser";
import datasets from "../../helpers/datasets";
import docs from "../../helpers/docs"

export default {
  name: 'DocTable',
  methods: {
    refresh() {
      datasets.parseData(this.manifest, this.docParams.data, this.baseURI).then((dataset) => {
        this.dataset = dataset
      });
    }
  },
  mounted(){
    this.refresh();
  },
  watch: {
    url () { this.refresh() }
  },
  computed: {
    baseURI() {
      return docs.urlFromProfile({source: this.docParams.data},
            (window.Vuex.state.sources.find((item) => item.path === `/datasets/${this.document}`) || {}).location
        );
    },
    manifest() {
      return this.$store.state.manifest[manifest_parser.MODE_AS_IS] || {};
    },
    docParams() {
      return (this.manifest.docs || {})[this.document];
    },
    headers () {
      return [
          {
            text: 'Dessert (100g serving)aa',
            align: 'left',
            sortable: false,
            value: 'name'
          },
          { text: 'Calories', value: 'calories' },
          { text: 'Fat (g)', value: 'fat' },
          { text: 'Carbs (g)', value: 'carbs' },
          { text: 'Protein (g)', value: 'protein' },
          { text: 'Iron (%)', value: 'iron' }
        ];
    }
  },
  props: {
    document: String
  },
  data() {
    return {
      error: null,
      dataset: null
    }
  }
};
</script>

<style>

</style>

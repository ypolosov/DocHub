<template>
  <v-data-table
    :headers="headers"
    :items="desserts"
    class="elevation-1"
  >
    <template v-slot:items="props" v-if="manifest">
      <td>{{ props.item.name }}</td>
      <td class="text-xs-right">{{ props.item.calories }}</td>
      <td class="text-xs-right">{{ props.item.fat }}</td>
      <td class="text-xs-right">{{ props.item.carbs }}</td>
      <td class="text-xs-right">{{ props.item.protein }}</td>
      <td class="text-xs-right">{{ props.item.iron }}</td>
    </template>
  </v-data-table>
</template>

<script>

import manifest_parser from "../../manifest/manifest_parser";
import requests from "../../helpers/requests";
import docs from "../../helpers/docs";

export default {
  name: 'DocTable',
  methods: {
    refresh() {
      if (this.docParams && this.docParams.source) {
        const dataset = (this.manifest.datasets || {})[this.docParams.source];
        if (dataset) {
          requests.request(this.url).then((response) => {
            this.query = response.data;
          }).catch((e) => {
            // eslint-disable-next-line no-console
            console.error(e, `Ошибка запроса (1) [${this.url}]`, e);
          });
        }
      }
    }
  },
  mounted(){
    this.refresh();
  },
  watch: {
    url () { this.refresh() }
  },
  computed: {
    manifest() {
      return this.$store.state.manifest[manifest_parser.MODE_AS_IS] || {};
    },
    docParams() {
      return (this.manifest.docs || {})[this.document];
    },
    url() {
      let result  = null;
      if (this.docParams && this.docParams.source) {
        const dataset = (this.manifest.datasets || {})[this.docParams.source];
        if (dataset) {
          result = docs.urlFromProfile({source: dataset.query},
              (this.$store.state.sources.find((item) => item.path === `/datasets/${this.docParams.source}`) || {}).location
          );
        }
      }
      return result;
    },
    headers () {
      return [
          {
            text: 'Dessert (100g serving)',
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
        query: null,
        desserts: [
          {
            name: 'Frozen Yogurt',
            calories: 159,
            fat: 6.0,
            carbs: 24,
            protein: 4.0,
            iron: '1%'
          },
          {
            name: 'Ice cream sandwich',
            calories: 237,
            fat: 9.0,
            carbs: 37,
            protein: 4.3,
            iron: '1%'
          },
          {
            name: 'Eclair',
            calories: 262,
            fat: 16.0,
            carbs: 23,
            protein: 6.0,
            iron: '7%'
          },
          {
            name: 'Cupcake',
            calories: 305,
            fat: 3.7,
            carbs: 67,
            protein: 4.3,
            iron: '8%'
          },
          {
            name: 'Gingerbread',
            calories: 356,
            fat: 16.0,
            carbs: 49,
            protein: 3.9,
            iron: '16%'
          },
          {
            name: 'Jelly bean',
            calories: 375,
            fat: 0.0,
            carbs: 94,
            protein: 0.0,
            iron: '0%'
          },
          {
            name: 'Lollipop',
            calories: 392,
            fat: 0.2,
            carbs: 98,
            protein: 0,
            iron: '2%'
          },
          {
            name: 'Honeycomb',
            calories: 408,
            fat: 3.2,
            carbs: 87,
            protein: 6.5,
            iron: '45%'
          },
          {
            name: 'Donut',
            calories: 452,
            fat: 25.0,
            carbs: 51,
            protein: 4.9,
            iron: '22%'
          },
          {
            name: 'KitKat',
            calories: 518,
            fat: 26.0,
            carbs: 65,
            protein: 7,
            iron: '6%'
          }
        ]
      };
  }
};
</script>

<style>

</style>

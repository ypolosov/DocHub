<template>
<v-card>
    <v-card-title v-if="(dataset || []).length > 10">
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Поиск"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="dataset || []"
      :search="search"
      :items-per-page="15"
      :multi-sort="true"
      class="elevation-1"
    >
      <template v-slot:no-data>
        <v-alert :value="true" color="error" icon="warning">
          Данных нет :(
        </v-alert>
      </template>  
    </v-data-table>
  </v-card>
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
      return (this.manifest.docs || {})[this.document] || {};
    },
    headers () {
      return this.docParams.headers || [];
    },
    perPage() {
      // eslint-disable-next-line no-debugger
      debugger
      return this.docParams["per-page"];
    }
  },
  props: {
    document: String
  },
  data() {
    return {
      error: null,
      dataset: null,
      search: ''
    }
  }
};
</script>

<style>

</style>

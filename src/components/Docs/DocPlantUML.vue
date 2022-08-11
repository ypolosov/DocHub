<template>
  <plantuml v-if="this.uml" :uml="uml"></plantuml>
</template>

<script>

import Plantuml from "../Schema/PlantUML";
import docs from "../../helpers/docs";
import requests from "../../helpers/requests";

export default {
  name: 'DocPlantUML',
  components: {
    Plantuml
  },
  mounted() {
    this.refresh();
  },
  methods: {
    refresh() {
      if (!this.url) {
        this.uml = '';
        return;
      }
      requests.request(this.url).then((response) => {
        this.uml = response.data.toString();
      })
      // eslint-disable-next-line no-console
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e, `Ошибка запроса (2) [${this.url}]`, e);
      });
    }
  },
  watch: {
    url () { this.refresh() }
  },
  computed: {
    url () {
      const profile = this.manifest.docs ? this.manifest.docs[this.document] : null;
      return profile ?
          docs.urlFromProfile(profile,
              (this.$store.state.sources.find((item) => item.path === `/docs/${this.document}`) || {}).location
          )
          : '';
    }
  },
  props: {
    document: String
  },
  data() {
    return {
      uml: ''
    };
  }
};
</script>

<style>

</style>

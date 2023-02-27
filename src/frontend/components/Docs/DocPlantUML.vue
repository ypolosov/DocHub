<template>
  <box>
    <plantuml v-if="uml" v-bind:uml="uml" v-bind:context-menu="contextMenu" />
  </box>
</template>

<script>
  import mustache from 'mustache';

  import Plantuml from '@front/components/Schema/PlantUML.vue';
  import requests from '@front/helpers/requests';
  
  import DocMixin from './DocMixin';

  export default {
    name: 'DocPlantUML',
    components: {
      Plantuml
    },
    mixins: [DocMixin],
    data() {
      return {
        uml: ''
      };
    },
    methods: {
      refresh() {
        if (!this.url) {
          this.uml = '';
          return;
        }
        requests.request(this.url).then((response) => {
          const content = response.data.toString();
          if (this.isTemplate) {
            this.uml = mustache.render(content, this.source.dataset);
          } else this.uml = content;
        }).catch((e) => this.error = e);
        this.sourceRefresh();
      }
    }
  };
</script>

<style>

</style>

<template>
  <div style="height: 100%;">
    <empty v-if="isEmpty" />
    <template v-else-if="error">
      <v-alert v-bind:value="true" color="error" icon="warning">
        Возникла ошибка при генерации контекста [{{ context }}]
        <br>[{{ error }}]
      </v-alert>
    </template>
    <template v-else>
      <plantuml 
        v-if="isCustomUML && customUML" 
        v-bind:uml="customUML" />
      <schema 
        v-else
        v-bind:schema="schema" />
    </template>
  </div>
</template>

<script>
  import Empty from '@front/components/Controls/Empty.vue';
  import requests from '@front/helpers/requests';
  import datasets from '@front/helpers/datasets';
  import Schema from '@front/components/Schema/Schema.vue';
  import query from '@front/manifest/query';
  import Plantuml from '@front/components/Schema/PlantUML.vue';

  export default {
    name: 'Context',
    components: {
      Schema,
      Plantuml,
      Empty
    },
    props: {
      context: { type: String, default: '' }
    },
    data() {
      return {
        provider: datasets(),
        error: null,
        dataset: null,
        refresher: null,
        customUML: null
      };
    },
    computed: {
      isEmpty() {
        return !(this.manifest.contexts || {})[this.context];
      },
      contextParams() {
        return Object.assign({'source': '($)'}, (this.manifest.contexts || {})[this.context] || {}) ;
      },
      baseURI() {
        return this.$store.state.sources[`/contexts/${this.context}`][0];
      },
      schema() {
        this.$nextTick(this.reloadCustomUML);
        const result = query.expression(query.context(this.context, this.location)).evaluate(this.dataset) || {};
        return result;
      },
      isCustomUML() {
        return typeof this.schema.uml === 'string';
      }
    },
    watch: {
      context() { 
        this.refresh(); 
      },
      manifest() { 
        this.refresh(); 
      }
    },
    mounted(){
      this.refresh();
    },
    methods : {
      reloadCustomUML() {
        if (!this.isCustomUML) return;
        requests.request(this.schema.uml, this.baseURI)
          .then((response) => {
            this.customUML = response.data;
          }).catch((err) => {
            // eslint-disable-next-line no-console
            console.error(err);
          });
      },
      refresh() {
        this.refresher && clearTimeout(this.refresher);
        this.dataset = null;
        this.refresher = setTimeout(() => {
          this.provider.getData(this.manifest, this.contextParams)
            .then((dataset) => {
              this.dataset = dataset;
            })
            .catch((e) => this.error = e)
            .finally(() => this.refresher = null);
        }, 50);
      }
    }
  };
</script>

<style scoped>

</style>

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
        v-bind:schema="schema" 
        v-bind:base-u-r-i="baseURI" />
    </template>
  </div>
</template>

<script>
  import Empty from '@front/components/Controls/Empty.vue';
  import requests from '@front/helpers/requests';
  import Schema from '@front/components/Schema/Schema.vue';
  import query from '@front/manifest/query';
  import Plantuml from '@front/components/Schema/PlantUML.vue';
  import uriTool from '@front/helpers/uri';

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
        error: null,
        customUML: null,
        isReady: false
      };
    },
    asyncComputed: {
      async schema() {
        // *******************************************************
        //      ТУТ ВЕРОЯТНО ОТЪЕХАЛИ ДАТАСЕТЫ В КОНТЕКСТАХ
        //  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // *******************************************************
        const result = await query.expression(query.context(this.context, this.location)).evaluate() || {};
        this.isReady = true;
        return result;
      }
    },
    computed: {
      path() {
        return `/contexts/${this.context}`;
      },
      isEmpty() {
        return this.isReady && !this.$store.state.isReloading && !this.schema;
      },
      baseURI() {
        return uriTool.getBaseURIOfPath(this.path);
      },
      isCustomUML() {
        return typeof this.schema?.uml === 'string';
      }
    },
    watch: {
      schema() {
        this.reloadCustomUML();
      }
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
      }
    }
  };
</script>

<style scoped>

</style>

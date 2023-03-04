<template>
  <v-card
    style="
      overflow: hidden;
      position: relative;
      min-height: 600px;
    ">
    <v-card-title>
      <v-icon left>mdi-link</v-icon>
      <span class="title">Контексты</span>
    </v-card-title>
    <v-select
      v-model="context"
      v-bind:items="contexts"
      item-text="title"
      item-value="id"
      return-object
      class="d-flex"
      cols="12"
      sm="12"
      style="margin: 0 12px 0px 12px" />
    <v-card-text
      class="headline font-weight-bold"
      style="
        position: absolute;
        top: 108px;
        left: 0;
        bottom: 0;
        right: 0;
        overflow: auto;
      ">
      <schema v-bind:schema="schema" style="min-height:calc(100% - 24px)" v-bind:base-u-r-i="baseURI" />
    </v-card-text>
  </v-card>
</template>

<script>

  import Schema from '@front/components/Schema/Schema.vue';
  import query from '@front/manifest/query';

  export default {
    name: 'TabContexts',
    components: {
      Schema
    },
    props: {
      defaultContext: { type: Object, default: null },
      contexts: { type: Array, default: () => ([]) }
    },
    data() {
      return {
        selected : null,
        currentContext: 0
      };
    },
    asyncComputed: {
      async schema() {
        if (!this.context) return null;

        const expression = query.expression(
          this.context.type === 'component' ?
            query.component(this.context.id) :
            query.context(this.context.id)
        );

        return await expression.evaluate();
      }
    },
    computed: {
      baseURI() {
        const path = this.context.type === 'component' 
          ?`/components/${this.context.id}`
          :`/contexts/${this.context.id}`;

        return this.$store.state.sources[path][0];
      },
      context: {
        get() {
          if (!this.selected) {
            return this.defaultContext || this.contexts[0];
          }

          return this.selected;
        },
        set(value) {
          this.selected = value;
        }
      }
    },
    watch: {
      contexts() {
        this.selected = null;
      }
    }
  };
</script>

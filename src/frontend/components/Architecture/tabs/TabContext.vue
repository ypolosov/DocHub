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
      <entity entity="contexts" presentation="plantuml" v-bind:params="params" style="min-height:calc(100% - 24px)" />
    </v-card-text>
  </v-card>
</template>

<script>

  import Entity from '@front/components/Entities/Entity.vue';

  export default {
    name: 'TabContexts',
    components: {
      Entity
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
    computed: {
      params() {
        if (this.context.type === 'component') 
          return {
            id: 'SELF',
            componentId: this.context.id
          };
        else return {
          id: this.context.id
        };
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

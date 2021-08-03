<template>
  <v-container fluid class="lighten-4">
    <v-row dense>
      <v-col cols="4">
        <v-card>
          <v-card-title>
            <v-icon left>settings</v-icon>
            <span class="title">Сводка</span>
          </v-card-title>
          <v-card-text class="headline font-weight-bold">
            <v-list>
              <v-list-item :key="item.title" v-for="(item) in summary" :link="!!item.link">
                <v-list-item-content  @click="goToLink(item.link)">
                  <v-list-item-subtitle v-text="item.title"></v-list-item-subtitle>
                  <v-list-item-title v-text="item.content"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="8">
        <v-card v-if="contexts.length">
          <v-card-title>
            <v-icon left>link</v-icon>
            <span class="title">Контексты</span>
          </v-card-title>
          <v-card-text class="headline font-weight-bold">
            <v-tabs v-model="currentContext">
              <v-tab v-for="context in contexts" :key="context.id" ripple>
                {{ context.title }}
              </v-tab>
            </v-tabs>
            <schema :schema="schema"></schema>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import Schema from '../Schema/Schema';
import jsonata from "jsonata";
import query from "../../manifest/query";
import manifest_parser from "../../manifest/manifest_parser";

export default {
  name: 'Component_',
  components: {
    Schema
  },
  methods: {
    goToLink() {

    }
  },
  computed: {
    schema () {
      if (this.currentContext === 0) {
        return jsonata(query.component(this.component))
            .evaluate(this.$store.state.manifest[manifest_parser.MODE_AS_IS]);
      } else {
        return jsonata(query.context(this.contexts[this.currentContext].id))
            .evaluate(this.$store.state.manifest[manifest_parser.MODE_AS_IS]);
      }
    },
    contexts() {
      return [{
        id: 'self',
        title: 'SELF'
      }].concat(jsonata(query.contextsForComponent(this.component))
          .evaluate(this.$store.state.manifest[manifest_parser.MODE_AS_IS]));
    },
    summary() {
      return []
    }
  },
  props: {
    component: String
  },
  data() {
    return {
      currentContext: 0
    };
  }
};
</script>

<style scoped>

</style>

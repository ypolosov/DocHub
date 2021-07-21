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
            <schema :context="contextBtoa" :focus="component"></schema>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import Schema from './Schema';
import requests from '../../helpers/requests';
import entity from "../../helpers/entity";

export default {
  name: 'Component',
  components: {
    Schema
  },
  methods: {
    goToLink(link) {
      window.location = requests.makeURL(link).url;
    }
  },
  computed: {
    componentID () {
      return atob(this.component);
    },
    summary () {
      return entity.buildSummary('component', this.componentID);
    },
    contextBtoa() {
      return btoa(this.contexts[this.currentContext].id);
    },
    contexts () {
      const contexts = {};
      const component = this.$store.state.components[this.componentID] || {};
      component.presentations && component.presentations.map((presentation) => {
        presentation.contexts && presentation.contexts.map((context) => {
          contexts[context] = (this.$store.state.contexts[context] && this.$store.state.contexts[context].title) || context;
        });
      });

      const result = [{
          id: 'self',
          title: 'Self'
      }];
      for (const context in contexts) {
        result.push({
          id: context,
          title: contexts[context]
        });
      }
      return result;
    }
  },
  props: {
    context: String,
    component: String,
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

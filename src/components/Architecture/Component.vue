<template>
  <v-container fluid class="lighten-4">
    <v-row dense>
      <v-col cols="4">
        <v-card>
          <v-card-title>
            <v-icon large left>settings</v-icon>
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
        <v-card>
          <v-card-title>
            <v-icon large left>link</v-icon>
            <span class="title">Контексты</span>
          </v-card-title>
          <v-card-text class="headline font-weight-bold">
            <v-tabs v-model="currentContext">
              <v-tab v-for="context in contexts" :key="context.id" ripple>
                {{ context.title }}
              </v-tab>
              <v-tab-item v-for="context in contexts" :key="context.id">
                <schema :context="contextBtoa" :focus="component"></schema>
              </v-tab-item>
            </v-tabs>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import plantUML from '../../helpers/plantuml';
import Schema from './Schema';
import requests from '../../helpers/requests';

export default {
  name: 'Component',
  components: {
    Schema
  },
  methods: {
    goToLink(link) {
      window.location = requests.makeURL(link);
    }
  },
  computed: {
    svgURL() {
      let uml = '@startuml\n';
      uml += '@enduml\n';
      // eslint-disable-next-line no-console
      console.info(uml);
      return plantUML.svgURL(uml);
    },
    componentID () {
      return atob(this.component);
    },
    summary () {
      const result =[
          {
            title: 'Идентификатор',
            content: this.componentID
          }
      ];

      if (this.$store.state.components[this.componentID]) {
        const component = this.$store.state.components[this.componentID];
        result.push({
              title: 'Наименование',
              content: component.title
            });
        component.locations.map((location) => {
          result.push({
            title: 'Размещение',
            content: location,
            link: location
          });
        });
      }
      return result;
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

      const result = [];
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

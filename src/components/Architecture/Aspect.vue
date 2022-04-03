<template>
  <v-container grid-list-xl fluid>
    <empty v-if="isEmpty"></empty>
    <v-layout wrap v-else>
      <v-flex xs12 md5 d-flex>
        <v-layout wrap>
          <v-container grid-list-xl fluid>
            <v-card>
              <v-card-title>
                <v-icon left>settings</v-icon>
                <span class="title">Сводка</span>
              </v-card-title>
              <v-card-text class="headline font-weight-bold">
                <v-list>
                  <v-list-item :key="item.title" v-for="(item) in summary" :link="!!item.link">
                    <v-list-item-content @click="goToLink(item.link)">
                      <v-list-item-subtitle v-text="item.title"></v-list-item-subtitle>
                      <v-list-item-title v-html="item.content"></v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
            <Docs :subject="aspect"></Docs>
            <v-card class="card-item" xs12 md12 v-if="components.length">
              <v-card-title>
                <v-icon left>settings</v-icon>
                <span class="title">Встречается в компонентах</span>
              </v-card-title>
              <v-card-text class="headline font-weight-bold">
                <ul style="font-size: 16px">
                  <li :key="component.id" v-for="(component) in components">
                    <router-link :to="`/architect/components/${component.id}`">
                      {{component.title.replace(/\n/g, ' ')}}
                    </router-link>
                  </li>
                </ul>
              </v-card-text>
            </v-card>
            <v-card class="card-item" xs12 md12>
              <v-card-title>
                <v-icon left>description</v-icon>
                <span class="title">Иерархия</span>
              </v-card-title>
              <v-card-text class="headline font-weight-bold">
                <aspects-mindmap :root="aspect" style="width: 100%"></aspects-mindmap>
              </v-card-text>
            </v-card>
            <src-locations :locations="srcLocations"></src-locations>
          </v-container>
        </v-layout>
      </v-flex>
      <v-flex xs12 md7 d-flex>
        <tab-contexts 
          v-if="contexts.length" style="width: 100%"
          :contexts = "contexts"
          :manifest = "manifest"
          d-flex
        >
        </tab-contexts>  
      </v-flex>
    </v-layout>
    <div style="display: none" v-html="focusStyle"></div>
  </v-container>
</template>

<script>

import query from "../../manifest/query";
import manifest_parser from "../../manifest/manifest_parser";
import Docs from "./tabs/Docs.vue";
import AspectsMindmap from "@/components/Mindmap/AspectsMindmap";
import TabContexts from './tabs/TabContext.vue'
import Empty from '../Controls/Empty.vue'
import SrcLocations from './tabs/SrcLocations.vue';

export default {
  name: 'Aspect',
  components: {
    Docs,
    AspectsMindmap,
    TabContexts,
    Empty,
    SrcLocations
  },
  methods: {
    goToLink() {

    }
  },
  computed: {
    isEmpty() {
      return !((this.manifest || {}).aspects || {})[this.aspect];
    },
    focusStyle() {
      return `
        <style>
          a[href$="${this.aspect}"] text {
            font-size: 14px;
            fill: #f00;
            font-weight: 600;
            text-decoration-line: underline;
          }
        </style>
      `;
    },
    srcLocations() {
      let result = query.expression(query.locationsForAspect(this.aspect))
          .evaluate(this.$store.state.sources) || [];

      if (process.env.VUE_APP_DOCHUB_MODE === "plugin") {
        result = result.map((item) => ({
          title: item.title.slice(19),
          link: `${item.link}?entity=aspect&id=${this.aspect}`
        }));
      }

      return result;
    },
    components() {
      return query.expression(query.componentsForAspects(this.aspect)).evaluate(this.manifest) || [];
    },
    manifest () {
      return this.$store.state.manifest[manifest_parser.MODE_AS_IS];
    },
    contexts() {
      return query.expression(query.contextsForAspects(this.aspect)).evaluate(this.manifest) || [];
    },
    summary() {
      return (query.expression(query.summaryForAspect(this.aspect))
          .evaluate(this.$store.state.manifest[manifest_parser.MODE_AS_IS]) || []);
    }
  },
  props: {
    aspect: String
  },
  data() {
    return {};
  }
};
</script>

<style scoped>
.card-item {
  width: 100%;
  margin-top: 12px;
}
</style>

<template>
  <v-container grid-list-xl fluid>
    <div style="display: none" v-html="focusStyle"></div>
    <empty v-if="isEmpty"></empty>
    <v-layout wrap v-else>
      <v-flex xs12 md5 d-flex>
        <v-layout wrap>
          <v-container grid-list-xl fluid>
            <v-card class="card-item" xs12 md12>
              <v-card-title>
                <v-icon left>settings</v-icon>
                <span class="title">Сводка</span>
              </v-card-title>
              <v-card-text class="headline font-weight-bold">
                <v-list>
                  <v-list-item :key="item.title" v-for="(item) in summary" :link="!!item.link">
                    <v-list-item-content  @click="goToLink(item.link)">
                      <v-list-item-subtitle v-text="item.title"></v-list-item-subtitle>
                      <v-list-item-title v-if = "item.onclick" :title="item.hint">
                        <a @click="item.onclick">{{item.content}}</a>
                      </v-list-item-title>
                      <v-list-item-title v-else v-html="item.content" :title="item.hint"
                      ></v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
            <Docs :subject="component"></Docs>
            <v-card class="card-item" xs12 md12 style="margin-top: 12px">
              <v-card-title>
                <v-icon left>description</v-icon>
                <span class="title">Иерархия</span>
              </v-card-title>
              <v-card-text class="headline font-weight-bold">
                <components-mindmap :root="component" links="component"></components-mindmap>
              </v-card-text>
            </v-card>
            <src-locations :locations="srcLocations">
            </src-locations>
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
  </v-container>
</template>

<script>

import query from "../../manifest/query";
import manifest_parser from "../../manifest/manifest_parser";
import ComponentsMindmap from "@/components/Mindmap/ComponentsMindmap";
import TabContexts from './tabs/TabContext.vue'
import Empty from '../Controls/Empty.vue'
import SrcLocations from './tabs/SrcLocations.vue';
import Docs from "./tabs/Docs.vue";

export default {
  name: 'ArchComponent',
  isVisibleTimeRange: true,
  components: {
    Docs,
    ComponentsMindmap,
    TabContexts,
    Empty,
    SrcLocations
  },
  methods: {
    goToLink() {
    },
    refreshTransitionsChanges() {
      this.$store.commit('setTimeMachineChanges', query.expression(query.archAllChangesTransforms())
          .evaluate(this.manifest) || []);
    }
  },
  mounted() {
    this.refreshTransitionsChanges();
  },
  watch: {
    manifest() {
      this.refreshTransitionsChanges();
    }
  },
  computed: {
    isEmpty() {
      return !((this.manifest || {}).components || {})[this.component];
    },
    focusStyle() {
      return `
        <style>
          a[href$="${this.component}"] text {
            font-size: 14px;
            fill: #f00;
            font-weight: 600;
            text-decoration-line: underline;
          }
        </style>
      `;
    },
    manifest () {
      return this.$store.state.manifest[manifest_parser.MODE_AS_IS];
    },
    contexts() {
      return [{
        id: this.component,
        title: 'SELF',
        type: 'component'
      }].concat(query.expression(query.contextsForComponent(this.component))
          .evaluate(this.manifest) || []);
    },
    srcLocations() {
      let result = query.expression(query.locationsForComponent(this.component))
          .evaluate(this.$store.state.sources) || [];

      if (process.env.VUE_APP_DOCHUB_MODE === "plugin") {
        result = result.map((item) => ({
          title: item.title.slice(19),
          link: `${item.link}?entity=component&id=${this.component}`
        }));
      }

      return result;
    },
    summary() {
      return (query.expression(query.summaryForComponent(this.component))
          .evaluate(this.manifest) || []);
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

.card-item {
  width: 100%;
}

</style>

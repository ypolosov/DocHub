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
            <v-card class="card-item" xs12 md12 style="margin-top: 12px">
              <v-card-title>
                <v-icon left>description</v-icon>
                <span class="title">Документы</span>
              </v-card-title>
              <v-card-text class="headline font-weight-bold">
                <docs-tree :entity="component"></docs-tree>
              </v-card-text>
            </v-card>
            <v-card class="card-item" xs12 md12 style="margin-top: 12px">
              <v-card-title>
                <v-icon left>description</v-icon>
                <span class="title">Иерархия</span>
              </v-card-title>
              <v-card-text class="headline font-weight-bold">
                <components-mindmap :root="component" links="component"></components-mindmap>
              </v-card-text>
            </v-card>
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
import requests from "../../helpers/requests";
import DocsTree from "../Docs/DocsTree";
import ComponentsMindmap from "@/components/Mindmap/ComponentsMindmap";
import TabContexts from './tabs/TabContext.vue'
import Empty from '../Controls/Empty.vue'

export default {
  name: 'Component',
  components: {
    DocsTree,
    ComponentsMindmap,
    TabContexts,
    Empty
  },
  methods: {
    goToLink() {

    }
  },
  computed: {
    isEmpty() {
      return !(this.manifest.components || {})[this.component];
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
    sourceLocations() {
      return query.expression(query.locationsForComponent(this.component))
          .evaluate(this.$store.state.sources) || [];
    },
    contexts() {
      return [{
        id: this.component,
        title: 'SELF',
        type: 'component'
      }].concat(query.expression(query.contextsForComponent(this.component))
          .evaluate(this.manifest) || []);
    },
    summary() {
      const locations = this.sourceLocations.map((location) => {
        const url = requests.makeURL(location).url;
        return process.env.VUE_APP_DOCHUB_MODE === "plugin"
          ?  {
            title: 'Размещение',
            content: url.toString().substring(19),
            hint: url.toString().substring(19),
            onclick: () => {
              window.$PAPI.goto(url, 'component', this.component);
              return false;
            }
          }
          : {
            title: 'Размещение',
            hint: url,
            content: `<a href="${url}" target="_blank">${location}</a>`
          }
      });

      return (query.expression(query.summaryForComponent(this.component))
          .evaluate(this.manifest) || [])
          .concat(locations)
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

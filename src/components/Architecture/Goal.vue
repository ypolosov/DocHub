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
            <Docs :subject="goal"></Docs>
            <v-card class="card-item" xs12 md12>
              <v-card-title>
                <v-icon left>description</v-icon>
                <span class="title">Иерархия</span>
              </v-card-title>
              <v-card-text class="headline font-weight-bold">
                <goals-mindmap :root="goal" style="width: 100%"></goals-mindmap>
              </v-card-text>
            </v-card>
            <src-locations :locations="srcLocations"></src-locations>
          </v-container>
        </v-layout>
      </v-flex>
    </v-layout>
    <div style="display: none" v-html="focusStyle"></div>
  </v-container>
</template>

<script>

import query from "../../manifest/query";
import manifest_parser from "../../manifest/manifest_parser";
import Docs from "./tabs/Docs.vue";
import GoalsMindmap from "@/components/Mindmap/GoalsMindmap";
import Empty from '../Controls/Empty.vue'
import SrcLocations from './tabs/SrcLocations.vue';

export default {
  name: 'Goal',
  components: {
    Docs,
    GoalsMindmap,
    Empty,
    SrcLocations
  },
  methods: {
    goToLink() {

    }
  },
  computed: {
    isEmpty() {
      return !((this.manifest || {}).goals || {})[this.goal];
    },
    focusStyle() {
      return `
        <style>
          a[href$="${this.goal}"] text {
            font-size: 14px;
            fill: #f00;
            font-weight: 600;
            text-decoration-line: underline;
          }
        </style>
      `;
    },
    srcLocations() {
      let result = query.expression(query.locationsForGoal(this.goal))
          .evaluate(this.$store.state.sources) || [];

      if (process.env.VUE_APP_DOCHUB_MODE === "plugin") {
        result = result.map((item) => ({
          title: item.title.slice(19),
          link: `${item.link}?entity=goal&id=${this.goal}`
        }));
      }
      return result;
    },
    manifest () {
      return this.$store.state.manifest[manifest_parser.MODE_AS_IS];
    },
    summary() {
      return (query.expression(query.summaryForGoal(this.goal))
          .evaluate(this.$store.state.manifest[manifest_parser.MODE_AS_IS]) || []);
    }
  },
  props: {
    goal: String
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

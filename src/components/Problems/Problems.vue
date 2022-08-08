<template>
  <div>
    <v-container grid-list-xl fluid>
      <v-layout wrap>
        <v-flex xs12 md5 d-flex>
          <v-layout wrap>
            <v-container grid-list-xl fluid>
              <Validators></Validators>
            </v-container>
          </v-layout>
        </v-flex>
        <v-flex xs12 md7 d-flex>
          Здесь карточка проблемы
        </v-flex>
      </v-layout>
    </v-container>

    <v-container>
      <v-tabs v-model="currentTab">
        <v-tab v-for="tab in problems" :key="tab.title" ripple>
          {{ tab.title }}
        </v-tab>
      </v-tabs>
      <ul v-if="problems.length" style="margin-top: 16px">
        <li v-for="problem in problems[currentTab].problems" :key="problem.route">
          <a v-if="problem.target === 'plugin'" @click="onGoto(problem.route)">
            {{problem.title}}
          </a>
          <router-link v-else-if="!problem.target"
              :to="problem.route">{{problem.title}}
          </router-link>
          <a v-else :href="problem.route" :target="problem.target">
            {{problem.title}}
          </a>
        </li>
      </ul>
    </v-container>
  </div>
</template>

<script>

import Validators from './tabs/Validators.vue'

export default {
  name: 'Problems',
  components: {
    Validators 
  },
  methods: {
    onGoto(route) {
      window.$PAPI.goto(route);
    }
  },
  computed: {
    problems() {
      const tabs = {};
      this.$store.state.problems.map((item) => {
        !tabs[item.problem] && (tabs[item.problem] = []);
        tabs[item.problem].push(item);
      });

      const result = [];
      for (const tab in tabs) {
        result.push({
          title: tab,
          problems: tabs[tab]
        });
      }
      return result;
    }
  },
  props: {
  },
  data() {
    return {
      currentTab: 0
    };
  }
};
</script>

<style scoped>
</style>

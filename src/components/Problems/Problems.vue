<template>
  <div>
    <v-container grid-list-xl fluid>
      <v-layout wrap>
        <v-flex xs12 md5 d-flex>
          <v-layout wrap>
            <v-container grid-list-xl fluid>
              <Validators :subject="subject"></Validators>
            </v-container>
          </v-layout>
        </v-flex>
        <v-flex xs12 md7 d-flex>
          <problem-blank v-if="subject" :subject="subject"></problem-blank>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>

import Validators from './tabs/Validators.vue'
import ProblemBlank from './tabs/ProblemBlank.vue';

export default {
  name: 'Problems',
  components: {
    Validators,
    ProblemBlank
  },
  props: {
    subject: String
  },
  methods: {
    onGoto(route) {
      window.$PAPI.goto(route);
    }
  },
  data() {
    return {
    };
  }
};
</script>

<style scoped>
</style>

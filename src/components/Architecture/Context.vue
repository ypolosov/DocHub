<template>
  <v-container fluid class="lighten-4">
    <v-row dense>
      <v-col cols="12">
        <v-card>
          {{contextID}}
          <schema></schema>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Schema from './Schema';

export default {
  name: 'Context',
  components: {
    Schema
  },
  methods: {
  },
  computed: {
    contextID () {
      return this.$route.params.pathMatch;
    }
  },
  props: {
    context: String
  },
  data() {
    return {
      selectedContextID_: null
    };
  }
};
</script>

<style scoped>

</style>

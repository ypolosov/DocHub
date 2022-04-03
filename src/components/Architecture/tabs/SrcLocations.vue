<template>
    <v-card class="card-item">
      <v-card-title>
        <v-icon left>settings</v-icon>
        <span class="title">Размещение</span>
      </v-card-title>
      <v-card-text class="headline font-weight-bold">
        <ul class="source-list">
          <li
            class="source-list-item"
            v-for="item in locations"
            :key="item.link" 
          >
            <DCLink :href="item.link">{{item.title}}</DCLink>
          </li>
        </ul>
      </v-card-text>
    </v-card>
</template>

<script>

import DCLink from '../../Controls/DCLink.vue';

export default {
  components: { DCLink },
  name: 'SrcLocation',
  props: {
    locations: Array
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

  .source-list-item {
    font-stretch: normal;
    font-size: 16px;
    font-weight: 300;
  }
</style>

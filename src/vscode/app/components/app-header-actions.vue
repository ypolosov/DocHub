<template>
  <div>
    <!-- <v-btn v-if="isPlugin" icon title="Найти в коде" v-on:click="gotoCode">
      <v-icon>search</v-icon>
    </v-btn> -->
    <!-- <v-btn v-if="isPlugin" icon title="Отладка" v-on:click="showDebugger">
      <v-icon>mdi-bug</v-icon>
    </v-btn> -->
    <!-- <v-btn v-if="isPlugin" icon title="Обновить" v-on:click="reloadForce">
      <v-icon>refresh</v-icon>
    </v-btn> -->
  </div>
</template>

<script>
  export default {
    computed: {
      isPlugin() {
        return process.env.VUE_APP_DOCHUB_MODE === 'vs-plugin';
      }
    },
    methods: {
      gotoCode() {
        window.$PAPI.goto(window.location);
      },
      reloadForce() {
        window.$PAPI.reload();
      }
    }
  };
</script>

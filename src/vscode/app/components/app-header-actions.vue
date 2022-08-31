<template>
  <div>
    <!-- <v-btn v-if="isPlugin" icon title="Найти в коде" v-on:click="gotoCode">
      <v-icon>mdi-magnify</v-icon>
    </v-btn>
    <v-btn v-if="isPlugin" icon title="Отладка" v-on:click="showDebugger">
      <v-icon>mdi-bug</v-icon>
    </v-btn> -->
    <v-btn v-if="isPlugin" icon title="Обновить" v-on:click="reloadForce">
      <v-icon>mdi-reload</v-icon>
    </v-btn>
  </div>
</template>

<script>
  export default {
    computed: {
      isPlugin() {
        return window.$IDE_PLUGIN;
      }
    },
    methods: {
      gotoCode() {
        const struct = window.location.hash.split('/');
        switch (struct[1]) {
          case 'architect': {
            switch (struct[2]) {
              case 'contexts': 
                window.$PAPI.goto(null, 'context', struct[3]); 
                break;
              case 'aspects': 
                window.$PAPI.goto(null, 'aspect', struct[3]); 
                break;
              case 'components': 
                window.$PAPI.goto(null, 'component', struct[3]); 
                break;
            }
            break;
          }
          case 'docs': 
            window.$PAPI.goto(null, 'document', struct[2]); break;
        }
      },
      reloadForce() {
        window.$PAPI.reload();
      },
      showDebugger() {
        window.$PAPI.isDebug = true;
        window.$PAPI.showDebugger();
      }
    }
  };
</script>

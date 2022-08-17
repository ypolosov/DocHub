<template>
  <v-app>
    <div v-bind:class="$style.app">
      <p class="mb-4">Не найден корневой манифест архитектуры.</p>
      
      <div>
        <v-btn depressed color="primary" v-on:click="createEmptyProject">Создать пустой файл</v-btn>
        <v-btn class="ml-4" depressed color="primary" v-on:click="createExampleProject">Создать пример</v-btn>
      </div>
    </div>
  </v-app>
</template>

<script>

  export default {
    inject: ['vscodeExtensionService'],
    data() {
      return {};
    },
    methods: {
      createEmptyProject() {
        this.vscodeExtensionService.createEmptyProject();
      },
      createExampleProject() {
        this.vscodeExtensionService.createDefaultProject();
      }
    }
  };
</script>

<style module>
  .app {
    align-items: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }
</style>

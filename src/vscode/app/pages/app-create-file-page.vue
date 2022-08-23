<template>
  <div v-bind:class="$style.content">
    <p class="mb-4">Не найден корневой манифест архитектуры.</p>
      
    <div>
      <v-btn depressed color="primary" v-on:click="createEmpty">Создать пустой файл</v-btn>
      <v-btn class="ml-4" depressed color="primary" v-on:click="createDefault">Создать пример</v-btn>
    </div>
  </div>
</template>

<script>
  export default {
    inject: ['vscodeExtensionService'],
    methods: {
      createEmpty() {
        this.vscodeExtensionService.createOne();
        this.$router.push({ name: 'main' });
      },
      createDefault() {
        this.vscodeExtensionService.createOne();
        this.$router.push({ name: 'main' });
      }
    }
  };
</script>

<style module>
  .content {
    align-items: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }
</style>

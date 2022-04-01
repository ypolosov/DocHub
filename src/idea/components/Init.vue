<template>
    <div 
        style="width: 160px; height: 32px; left: 50%; top: 50%; position: absolute; margin-left: -80px; margin-top: -16px; text-align:center;"
    >
      Не наден корневой манифест архитектуры.
      <br>
      <v-btn depressed color="primary" @click="initProject">Создать</v-btn>
    </div>

</template>

<script>

export default {
  name: 'Empty',
  methods: {
    initProject() {
      window.$PAPI.initProject();
    }
  },
  data() {
    return {};
  }
};
</script>

<style scoped>


</style>

<template>
    <v-card class="card-item">
      Карточка проблемы
    </v-card>
</template>

<script>

export default {
  name: 'Validators',
  components: {
  },
  computed: {
    problems() {
      return this.$store.state.problems || [];
    },
  },
  props: {
    subject: String
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

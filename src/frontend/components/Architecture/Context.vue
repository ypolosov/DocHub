<template>
  <entity
    entity="contexts"
    presentation="plantuml"
    v-bind:params="{ id: context }" />
</template>

<script>
  import Entity from '@front/components/Entities/Entity.vue';

  export default {
    name: 'Context',
    components: {
      Entity
    },
    props: {
      context: { type: String, default: '' }
    },
    data() {
      return {};
    }
  };
</script>

<style scoped>

</style>

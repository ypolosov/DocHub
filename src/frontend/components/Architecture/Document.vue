<template>
  <entity
    entity="docs"
    presentation="blank"
    v-bind:params="{ 'dh-doc-id': document }" />
</template>

<script>
  import Entity from '@front/components/Entities/Entity.vue';

  export default {
    name: 'Context',
    components: {
      Entity
    },
    props: {
      document: { type: String, default: '' }
    },
    data() {
      return {};
    }
  };
</script>

<style scoped>

</style>

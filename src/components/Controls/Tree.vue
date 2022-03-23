<template>
  <tree-item :items="items"></tree-item>
</template>

<script>

import TreeItem from "./TreeItem";

export default {
  name: 'Tree',
  components: {
    TreeItem
  },
  methods: {
  },
  computed: {
  },
  props: {
    items: Array
  },
  data() {
    return {
    };
  }
}
</script>

<style>

</style>

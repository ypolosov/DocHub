<template>
  <div class="dochub-object">
    <dochub-doc v-if="isDocument" :document="subject"></dochub-doc>
    <dochub-context v-if="isContext" :context="subject"></dochub-context>
  </div>
</template>

<script>

export default {
  name: 'DocHubObject',
  computed: {
    isDocument() {
      return this.type.toLowerCase() === 'document';
    },
    isContext() {
      return this.type.toLowerCase() === 'context';
    }
  },
  props: {
    type: String,
    subject: String
  },
  data() {
    return {};
  }
};
</script>

<style>

</style>

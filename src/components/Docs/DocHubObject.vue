<template>
  <div class="dochub-object">
    <dochub-doc v-if="isDocument" :document="subject"></dochub-doc>
    <dochub-context v-if="isContext" :context="subject"></dochub-context>
    <dochub-aspect v-if="isAspect" :aspect="subject"></dochub-aspect>
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
    },
    isAspect() {
      return this.type.toLowerCase() === 'aspect';
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

<template>
  <div class="dochub-object">
    <dochub-doc v-if="isDocument" :document="subject"></dochub-doc>
    <dochub-context v-if="isContext" :context="subject"></dochub-context>
    <dochub-aspect v-if="isAspect" :aspect="subject"></dochub-aspect>
    <dochub-component v-if="isComponent" :component="subject"></dochub-component>
    <dochub-technology v-if="isTechnology" :technology="subject"></dochub-technology>
    <dochub-radar v-if="isRadar" :section="subject"></dochub-radar>
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
    },
    isComponent() {
      return this.type.toLowerCase() === 'component';
    },
    isTechnology() {
      return this.type.toLowerCase() === 'technology';
    },
    isRadar() {
      return this.type.toLowerCase() === 'radar';
    },
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

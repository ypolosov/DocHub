<template>
  <div class="dochub-object">
    <dochub-doc v-if="isDocument" :document="srcStruct.subject" :alt="alt"></dochub-doc>
    <dochub-context v-if="isContext" :context="srcStruct.subject" :alt="alt"></dochub-context>
    <dochub-aspect v-if="isAspect" :aspect="srcStruct.subject" :alt="alt"></dochub-aspect>
    <dochub-component v-if="isComponent" :component="srcStruct.subject" :alt="alt"></dochub-component>
    <dochub-technology v-if="isTechnology" :technology="srcStruct.subject" :alt="alt"></dochub-technology>
    <dochub-radar v-if="isRadar" :section="srcStruct.subject" :alt="alt"></dochub-radar>
    <img v-if="isImage" :src="srcStruct.subject" :alt="alt"/>
  </div>
</template>

<script>

export default {
  name: 'DocHubObject',
  computed: {
    isDocument() {
      return this.srcStruct.type.toLowerCase() === 'document';
    },
    isContext() {
      return this.srcStruct.type.toLowerCase() === 'context';
    },
    isAspect() {
      return this.srcStruct.type.toLowerCase() === 'aspect';
    },
    isComponent() {
      return this.srcStruct.type.toLowerCase() === 'component';
    },
    isTechnology() {
      return this.srcStruct.type.toLowerCase() === 'technology';
    },
    isRadar() {
      return this.srcStruct.type.toLowerCase() === 'radar';
    },
    isImage() {
      return this.srcStruct.type.toLowerCase() === 'image';
    },
    srcStruct () {
      const result = {
        type: this.type || 'image',
        subject: this.subject || this.src,
        params: {}
      };
      try {
        if (this.src.substr(0, 1) === '@') {
          const uri = new URL(this.src.replace('@', '/'), window.origin);
          const path = uri.pathname.split('/');
          result.type = path[1];
          result.subject = path[2];
          result.params = uri.searchParams;
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e);
      }
      return result;
    }
  },
  props: {
    src: String,
    alt: String,
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

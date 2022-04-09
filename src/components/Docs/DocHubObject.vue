<template>
  <div class="dochub-object" :style="{float:srcStruct.float}">
    <dochub-doc v-if="isDocument" :document="srcStruct.subject" :alt="srcStruct.alt"></dochub-doc>
    <dochub-context v-else-if="isContext" :context="srcStruct.subject" :alt="srcStruct.alt"></dochub-context>
    <dochub-aspect v-else-if="isAspect" :aspect="srcStruct.subject" :alt="srcStruct.alt"></dochub-aspect>
    <dochub-component v-else-if="isComponent" :component="srcStruct.subject" :alt="srcStruct.alt"></dochub-component>
    <dochub-technology v-else-if="isTechnology" :technology="srcStruct.subject" :alt="srcStruct.alt"></dochub-technology>
    <dochub-radar v-else-if="isRadar" :section="srcStruct.subject" :alt="srcStruct.alt"></dochub-radar>
    <dochub-anchor v-else-if="isAnchor" :id="srcStruct.subject" :name="srcStruct.subject"></dochub-anchor>
    <dochub-image v-else :src="src" :alt="srcStruct.alt" :baseURI="baseURI"></dochub-image>
  </div>
</template>

<script>

import requests from '../../helpers/requests';

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
    isAnchor () {
      return this.srcStruct.type.toLowerCase() === 'anchor';
    },
    isImage() {
      return this.srcStruct.type.toLowerCase() === 'image';
    },
    // Параметры отображения встраиваемого объекта
    srcStruct () {
      const result = {
        type: this.type || 'image',
        subject: this.subject || this.src,
        params: {},
        float: 'none'
      };
      try {
        if (this.src.substr(0, 1) === '@') {
          const uri = new URL(this.src.replace('@', '/'), requests.getSourceRoot());
          const path = uri.pathname.split('/');
          result.type = path[1];
          result.subject = path[2];
          result.params = uri.searchParams;
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e);
      }

      // Определяем форматирование объекта
      const alt = this.alt || '';
      switch(alt.substr(0,1)) {
        case '<':
          result.float = 'left';
          result.alt = alt.substr(1);
          break;
        case '>':
          result.float = 'right';
          result.alt = alt.substr(1);
          break;
      }

      return result;
    }
  },
  props: {
    src: String,
    alt: String,
    type: String,
    subject: String,
    baseURI: String
  },
  data() {
    return {};
  }
};
</script>

<style>

</style>

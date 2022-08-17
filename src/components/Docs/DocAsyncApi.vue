<template>
  <div>
    <asyncapi-component
      v-if="schema"
      v-bind="{ schema, cssImportPath: '/assets/styles/asyncapi.css' }" />
  </div>
</template>

<script>
  import '@asyncapi/web-component/lib/asyncapi-web-component';

  import YAML from 'yaml';
  import requests from '@/helpers/requests';
  import mustache from 'mustache';
  import DocMixin from './DocMixin';

  export default {
    mixins: [DocMixin],
    data() {
      return {
        schema: ''
      };
    },
    methods: {
      refresh() {
        this.getSchema();
      },
      async getSchema() {
        requests.request(this.url, undefined, { raw: true }).then((response) => {
          let content = response.data;
          if (typeof content === 'object')
            content = YAML.stringify(content);
          if (this.isTemplate)
            content = mustache.render(content, this.source.dataset);
          this.schema = content;
        }).catch((e) => {
          // eslint-disable-next-line no-console
          console.error(`Ошибка запроса [${this.url}]`, e);
        });
        this.sourceRefresh();
      }
    }
  };
</script>

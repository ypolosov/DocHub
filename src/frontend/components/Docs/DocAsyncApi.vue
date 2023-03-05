<template>
  <box>
    <section ref="asyncApi" />
  </box>
</template>

<script>
  import '@assets/styles/asyncapi.min.css';
  import AsyncApiStandalone from '@asyncapi/react-component/browser/standalone';
  import mustache from 'mustache';

  import requests from '@front/helpers/requests';
  import DocMixin from './DocMixin';
  import { asyncApiStyles } from '@front/components/Docs/styles/asyncapi';

  export default {
    mixins: [DocMixin],
    methods: {
      renderRefSection(res) {
        AsyncApiStandalone.render({
          schema: res.data
        }, this.$refs.asyncApi);
      },
      refresh() {
        this.getSchema();
      },
      getSchema() {
        this.sourceRefresh().then(() => {
          const params = this.isTemplate ? {
            responseHook: (response) =>
              typeof response.data === 'string' ? {
                ...response,
                data: mustache.render(response.data, this.source.dataset)
              } : response
          } : undefined;

          requests.request(this.url, undefined, params)
            .then(this.renderRefSection)
            .catch((e) => this.error = e)
            .finally(() => {
              if (this.$refs?.asyncapi) {
                const html = this.$refs.asyncapi.shadowRoot.querySelector('style');
                html.innerHTML = asyncApiStyles;
              }
            });
        });
      }
    }
  };
</script>

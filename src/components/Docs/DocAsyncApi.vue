<template>
  <box>
    <section ref="asyncApi" />
  </box>
</template>

<script>
  import '@/assets/styles/asyncapi.min.css';
  import AsyncApiStandalone from '@asyncapi/react-component/browser/standalone';

  import requests from '@/helpers/requests';
  import mustache from 'mustache';
  import DocMixin from './DocMixin';
  import { asyncApiStyles } from '@/components/Docs/styles/asyncapi';

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

        this.sourceRefresh();
      }
    }
  };
</script>

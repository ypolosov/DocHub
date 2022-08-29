<template>
  <div>
    <asyncapi-component
      v-if="schema"
      ref="asyncapi"
      v-bind="{ schema }" />

    <v-alert
      v-bind:value="!!error"
      type="error">
      {{ error }}
    </v-alert>
  </div>
</template>

<script>
  import '@asyncapi/web-component/lib/asyncapi-web-component';

  import requests from '@/helpers/requests';
  import mustache from 'mustache';
  import DocMixin from './DocMixin';
  import { asyncApiStyles } from '@/components/Docs/styles/asyncapi';

  export default {
    mixins: [DocMixin],
    data() {
      return {
        schema: '',
        error: null
      };
    },
    methods: {
      refresh() {
        this.getSchema();
      },
      getSchema() {
        const params =  {
          raw: true
        };

        if (this.isTemplate) {
          params.responseHook= (response) => {
            response.data = mustache.render(response.data, this.source.dataset);

            return response;
          };
        }
        
        requests.request(this.url, undefined, params)
          .then((response) => {
            this.schema = response.data;
          })
          .catch((e) => {
            this.error = `${e} [${this.url}`;
            // eslint-disable-next-line no-console
            console.error(this.error);
          })
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

<template>
  <box v-bind:id="dom_id" />
</template>

<script>
  import SwaggerUI from 'swagger-ui';
  import requests from '../../helpers/requests';
  import mustache from 'mustache';
  import DocMixin from './DocMixin';

  export default {
    name: 'Swagger',
    mixins: [DocMixin],
    data() {
      return {
        dom_id : `swagger-${Date.now()}-${Math.round(Math.random() * 10000)}`,
        data: null
      };
    },
    methods: {
      refresh() {
        const params = this.isTemplate ? {
          responseHook: (response) => {
            if (typeof response.data === 'string') {
              response.data = mustache.render(response.data, this.source.dataset);
            }

            return response;
          }
        } : undefined;
        requests.request(this.url, undefined, params)
          .then((response) => {
            this.data = response.data;
            this.swaggerRender();
          }).catch((e) => this.error = e);
        this.sourceRefresh();
      },

      swaggerRender() {
        if (this.url) {
          SwaggerUI({
            dom_id: `#${this.dom_id}`,
            spec: this.data,
            deepLinking: true,
            presets: [
              SwaggerUI.presets.apis
            ]
          });
        }
      }
    }
  };
</script>

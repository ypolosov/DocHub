<template>
  <div
    v-if="url"
    v-bind:id="id">
    <v-alert
      v-bind:value="!!error"
      type="error">
      {{ error }}
    </v-alert>
  </div>
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
        id : `swagger-${Date.now()}-${Math.round(Math.random() * 10000)}`,
        data: null,
        error: null
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
          }).catch((e) => {
            this.error = `${e} [${this.url}]`;
            // eslint-disable-next-line no-console
            console.error(this.error);
          });
        this.sourceRefresh();  
      },

      swaggerRender() {
        if (this.url) {
          SwaggerUI({
            dom_id: `#${this.id}`,
            spec: this.data,
            presets: [
              SwaggerUI.presets.apis
            ]
          });
        }
      }
    }
  };
</script>

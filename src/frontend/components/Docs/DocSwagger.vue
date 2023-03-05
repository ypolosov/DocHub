<template>
  <box v-bind:id="dom_id" />
</template>

<script>
  import SwaggerUI from 'swagger-ui';
  import mustache from 'mustache';

  import requests from '@front/helpers/requests';
  
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
    watch: {
      isPrintVersion() {
        const el = document.getElementById(this.dom_id);
        el.innerHTML = '';
        this.$nextTick(this.swaggerRender);
      }
    },
    methods: {
      refresh() {
        this.sourceRefresh().then(() => {
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
        });
      },

      swaggerRender() {
        if (this.url) {
          SwaggerUI({
            dom_id: `#${this.dom_id}`,
            spec: this.data,
            deepLinking: true,
            docExpansion: this.isPrintVersion ? 'full' : 'list',
            presets: [
              SwaggerUI.presets.apis
            ]
          });
        }
      }
    }
  };
</script>

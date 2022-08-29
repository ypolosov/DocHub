<template>
  <div>
    <asyncapi-component
      v-if="schema"
      ref="asyncapi"
      v-bind="{ schema }" />
  </div>
</template>

<script>
  import '@asyncapi/web-component/lib/asyncapi-web-component';

  import YAML from 'yaml';
  import docs from '@/helpers/docs';
  import requests from '@/helpers/requests';
  import { asyncApiStyles } from '@/components/Docs/styles/asyncapi';

  export default {
    props: {
      document: { type: String, default: '' }
    },
    data() {
      return {
        schema: ''
      };
    },
    computed: {
      cssImportPath() {
        /* eslint-disable */
        return '/assets/styles/asyncapi.css';
        /* eslint-enable */
      },
      url() {
        const profile = this.manifest.docs?.[this.document] || null;

        return profile ? docs.urlFromProfile(
          profile, 
          this.$store.state.sources.find((item) => item.path === `/docs/${this.document}`)?.location
        ) : null;
      }
    },
    created() {
      this.onComponentCreated();
    },
    methods: {
      async onComponentCreated() {
        await this.getSchema();
        
        const html = this.$refs.asyncapi.shadowRoot.querySelector('style');
        html.innerHTML = asyncApiStyles;
      },
      async getSchema() {
        try {
          const { data } = await requests.request(this.url);
          
          this.schema = YAML.stringify(data);
        } catch (e) {
          //
        }
      }
    }
  };
</script>

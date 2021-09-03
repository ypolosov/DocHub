<template>
    <div
        :id="id"
        v-if="this.url"
    ></div>
</template>

<script>
import SwaggerUI from "swagger-ui";
import config from "../../../config";
import manifest_parser from "../../manifest/manifest_parser";
import docs from "../../helpers/docs";

export default {
  name: 'Swagger',
  mounted() {
    this.swaggerRender();
  },
  methods: {
    swaggerRender() {
      if (this.url) {
        SwaggerUI({
          dom_id: `#${this.id}`,
          url: this.url,
          // deepLinking: true,
          requestInterceptor: (request) => {
            if (config.gitlab_server && ((new URL(request.url)).host === (new URL(config.gitlab_server)).host)) {
              request.headers['Authorization'] = `Bearer ${this.$store.state.access_token}`;
            }
          }
        })
      }
    }
  },
  computed: {
    manifest() {
      return this.$store.state.manifest[manifest_parser.MODE_AS_IS] || {};
    },
    url () {
      // eslint-disable-next-line vue/no-async-in-computed-properties
      setTimeout(() => this.swaggerRender(), 50);
      const profile = this.manifest.docs ? this.manifest.docs[this.document] : null;
      return profile ?
          docs.urlFromProfile(profile,
              (this.$store.state.sources.find((item) => item.path === `/docs/${this.document}`) || {}).location
          )
          : '';
    }
  },
  props: {
    document: String
  },
  data() {
    return {
      id : `swagger-${Date.now()}-${Math.round(Math.random() * 10000)}`
    };
  }
};
</script>

<style>

.swagger-ui .info {
  display: none;
}

.swagger-ui .info {
  border-radius: 3px;
}

.swagger-ui .info .title {
  margin-left: 24px;
  margin-top: 24px;
  display: block;
  font-size: 24px !important;
  color: #fff;
}

.swagger-ui .info .url {
  margin-left: 24px;
  margin-top: 8px;
  display: block;
  font-size: 16px !important;
  color: #fff;
}

.swagger-ui .scheme-container {
  margin: 0;
  padding: 0 0 0 30px;
  background: none;
  -webkit-box-shadow: none;
  box-shadow: none;
}


.swagger-ui .info .main {
  background: #3495db;
}

.v-application code {
  background-color: transparent;
  -webkit-box-shadow: none;
  box-shadow: none;
}

</style>

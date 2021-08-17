<template>
  <div class="space">
    <div class="toc" v-html="toc"></div>
    <markdown
        v-if="this.markdown"
        style="padding: 12px"
        toc
        v-on:toc-rendered="tocRendered"
        v-on:rendered="rendered"
    >
      {{this.markdown}}
    </markdown>
  </div>
</template>

<script>

import docs from "../../helpers/docs";
import requests from "../../helpers/requests";
import manifest_parser from "../../manifest/manifest_parser";
import markdown from 'vue-markdown';

export default {
  name: 'DocMarkdown',
  components: {
    markdown
  },
  mounted() {
    this.refresh();
  },
  methods: {
    onClickRef(event) {
      const url = new URL(event.currentTarget.href, window.location);
      this.$router.push({ path: url.pathname});
      return false;
    },
    rendered() {
      const refs = this.$el.querySelectorAll('[href]');
      for (let i = 0; i < refs.length; i++) {
        const ref = refs[i];
        ref.onclick = this.onClickRef;
      }
    },
    tocRendered (tocHTML) {
      this.toc = tocHTML;
    },
    refresh() {
      if (!this.url) {
        this.markdown = '';
        return;
      }
      requests.request(this.url).then((response) => {
        this.markdown = response.data.toString();
      })
      // eslint-disable-next-line no-console
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e, `Ошибка запроса [${this.url}]`, e);
      });
    }
  },
  watch: {
    url () { this.refresh() }
  },
  computed: {
    manifest() {
      return this.$store.state.manifest[manifest_parser.MODE_AS_IS] || {};
    },
    url () {
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
      toc: '',
      markdown: ''
    };
  }
};
</script>

<style scoped>

.space {
  padding: 24px;
}

.toc {
  margin-bottom: 24px;
}

</style>

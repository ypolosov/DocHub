<template>
  <div class="space">
    <div class="toc" v-html="toc"></div>
    <markdown
        v-if="this.markdown"
        style="padding: 12px"
        toc :breaks="false"
        :html="true"
        v-show="false"
        v-on:toc-rendered="tocRendered"
        v-on:rendered="rendered"
    >
      {{this.markdown}}
    </markdown>
    <final-markdown v-if="showDocument && outHTML" :template="outHTML"></final-markdown>
  </div>
</template>

<script>
import docs from "../../helpers/docs";
import requests from "../../helpers/requests";
import manifest_parser from "../../manifest/manifest_parser";
import markdown from 'vue-markdown';
import DocMarkdownObject from "./DocHubObject";

export default {
  name: 'DocMarkdown',
  components: {
    markdown,
    finalMarkdown: {
      components: {
        "dochub-object": DocMarkdownObject
      },
      props: {
        template: String
      },
      created () {
        this.$options.template = `<div>${this.template}</div>`;
      }
    }
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
    rendered(outHtml) {
      if (this.outHTML !== outHtml) {
        this.outHTML = outHtml;
        this.showDocument = false;
        this.$nextTick(() => this.showDocument = true);
      }
      /*
      const refs = this.$el.querySelectorAll('[href]');
      for (let i = 0; i < refs.length; i++) {
        const ref = refs[i];
        ref.onclick = this.onClickRef;
      }
      */
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
      showDocument: false,
      toc: '',
      markdown: '',
      outHTML: ''
    };
  }
};
</script>

<style>

.dochub-object {
  margin-top: 24px;
  margin-bottom: 24px;
}

.space {
  padding: 24px;
}

.toc {
  margin-bottom: 24px;
}

pre {
  display: block;
  padding: 9.5px;
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.42857143;
  color: #333;
  word-break: break-all;
  word-wrap: break-word;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: auto;
}

code[class*="language-"], pre[class*="language-"] {
  color: black;
  font-weight: 300;
  background: none;
  text-shadow: 0 1px white;
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;
  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;
  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
  padding: 0;
  font-size: inherit;
  border-radius: 0;
}

.toc-anchor {
  display: none;
}

code[class*="language-"]::before, pre[class*="language-"]::before,
code[class*="language-"]::after, pre[class*="language-"]::after
{
  content: none !important;
}

</style>

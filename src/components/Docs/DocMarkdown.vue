<template>
  <div class="space">
    <dochub-anchor id=""></dochub-anchor>
    <div v-if="toc" class="toc" v-html="toc"></div>
    <markdown
        v-if="this.markdown"
        style="padding: 12px"
        toc
        :breaks="false"
        :html="false"
        v-show="false"
        v-on:toc-rendered="tocRendered"
        v-on:rendered="rendered"
    >
      {{this.markdown}}
    </markdown>
    <final-markdown v-if="showDocument && outHTML" :template="outHTML"></final-markdown>
    <v-progress-circular
        :size="64"
        :width="7"
        style="left: 50%; top: 50%; position: absolute; margin-left: -32px; margin-top: -32px;"
        v-else
        :value="60"
        color="primary"
        indeterminate
    ></v-progress-circular>
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
        this.$options.template = `<div class="markdown-document">${this.template}</div>`;
      }
    }
  },
  mounted() {
    this.refresh();
  },
  methods: {
    onClickRef(event) {
      const href = event.currentTarget.href;
      if (href.substr(0, 1) === '#')
        return true;
      const url = new URL(event.currentTarget.href, window.location);
      this.$router.push({ path: url.pathname});
      return false;
    },
    // eslint-disable-next-line no-unused-vars
    rendered(outHtml) {
      if (this.outHTML !== outHtml) {
        this.outHTML = outHtml.replaceAll('<img ', '<dochub-object ');
        this.showDocument = false;
        this.$nextTick(() => {
          this.showDocument = true;
          window.location.hash && setTimeout(() => window.location.href = window.location.hash, 50);
        });
        this.markdown = null;
      }
    },
    tocRendered (tocHTML) {
      // eslint-disable-next-line no-debugger
      debugger;
      this.toc = tocHTML;
    },
    refresh() {
      if (!this.url) {
        this.markdown = '';
        return;
      }
      this.outHTML = '';
      this.showDocument = false;
      this.toc = '';
      setTimeout(() => {
        requests.request(this.url).then((response) => {
          this.markdown = response.data.toString();
        })
        // eslint-disable-next-line no-console
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error(e, `Ошибка запроса [${this.url}]`, e);
        });
      }, 50);
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
  position: relative;
  min-height: 100vh;
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

.markdown-document table {
  border: solid #ccc 1px;
}

.markdown-document table td {
  padding-left: 6px;
  padding-right: 6px;
}

.markdown-document table thead th {
  background: rgb(52, 149, 219);
  color: #fff;
  height: 40px;
  padding: 0;
}

.markdown-document h1,
.markdown-document h2,
.markdown-document h3,
.markdown-document h4,
.markdown-document h5 {
  margin-top: 36px;
  margin-bottom: 18px;
  clear:both;
}

.markdown-document h1:first-child {
  margin-top: 12px;
}

.markdown-document ul,
.markdown-document ol
{
  margin-bottom: 18px;
}

</style>

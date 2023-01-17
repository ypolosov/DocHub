<template>
  <box class="space">
    <dochub-anchor id="" />
    <div v-if="toc" class="toc" v-html="toc" />
    <markdown
      v-if="(markdown !== null)"
      class="pa-3"
      toc
      v-bind:breaks="false"
      v-bind:html="false"
      v-bind:postrender="rendered"
      v-on:toc-rendered="tocRendered">
      {{ markdown }}
    </markdown>
    <final-markdown v-if="showDocument" v-bind:template="outHTML" v-bind:base-u-r-i="url" />
    <v-progress-circular
      v-else
      v-bind:size="64"
      v-bind:width="7"
      style="left: 50%; top: 50%; position: absolute; margin-left: -32px; margin-top: -32px;"
      v-bind:value="60"
      color="primary"
      indeterminate />
  </box>
</template>

<script>
  import requests from '@/helpers/requests';
  import markdown from 'vue-markdown';
  import DocMarkdownObject from './DocHubObject';
  import DocMixin from './DocMixin';
  import mustache from 'mustache';
  import href from '../../helpers/href';
  import './libs/prism';
  import './styles/prism.css';

  export default {
    name: 'DocMarkdown',
    components: {
      markdown,
      finalMarkdown: {
        components: {
          'dochub-object': DocMarkdownObject
        },
        props: {
          template: { type: String, default: '' },
          baseURI: { type: String, default: '' }
        },
        created() {
          this.$options.template = `<div class="markdown-document">${this.template}</div>`;
        },
        mounted() {
          href.elProcessing(this.$el);
        }
      }
    },
    mixins: [DocMixin],
    props: {
      tocShow: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        showDocument: false,
        toc: '',
        markdown: null,
        outHTML: null
      };
    },
    methods: {
      rendered(outHtml) {
        const result = outHtml.replace(/<img /g, '<dochub-object :baseURI="baseURI" :inline="true" ')
          .replace(/\{\{/g, '<span v-pre>{{</span>')
          .replace(/\}\}/g, '<span v-pre>}}</span>');
        if (this.outHTML != result) {
          this.showDocument = false;
          this.outHTML = result;
          this.$nextTick(() => {
            this.showDocument = true;
            window.location.hash && setTimeout(() => window.location.href = window.location.hash, 50);
          });
        }
        // eslint-disable-next-line no-undef
        Prism.highlightAll();
        return '';
      },
      mounted() {
        let recaptchaScript = document.createElement('script');
        recaptchaScript.setAttribute('src', '/libs/prism.js');
        document.head.appendChild(recaptchaScript);
      },
      tocRendered(tocHTML) {
        if (this.tocShow) this.toc = tocHTML;
      },
      refresh() {
        this.markdown = null;
        if (!this.url) return;
        this.outHTML = null;
        this.showDocument = false;
        this.toc = '';
        // Получаем шаблон документа
        setTimeout(() => {
          requests.request(this.url).then(({ data }) => {
            if (!data)
              this.markdown = 'Здесь пусто :(';
            else if (this.isTemplate) {
              this.markdown = mustache.render(data, this.source.dataset);
            } else
              this.markdown = data;
          }).catch((e) => this.error = e);
        }, 50);
        this.sourceRefresh();
      }
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
  /* min-height: 100vh; */
  min-height: 60px;
}
.toc {
  margin-bottom: 24px;
}

.markdown-document {
    font-size: 1rem;
    line-height: 1.5rem;
}

.markdown-document pre {
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
.markdown-document code[class*="language-"],
.markdown-document pre[class*="language-"] {
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
  font-size: 13px;
  border-radius: 0;
}
.toc-anchor {
  display: none;
}
.markdown-document code[class*="language-"]::before, pre[class*="language-"]::before,
.markdown-document code[class*="language-"]::after, pre[class*="language-"]::after
{
  content: none !important;
}
.markdown-document table {
  border: solid #ccc 1px;
}
.markdown-document table.table td {
  padding-left: 6px;
  padding-right: 6px;
}
.markdown-document table thead th * {
  color: #fff !important;
}
.markdown-document table thead th  {
  background: rgb(52, 149, 219);
  color: #fff !important;
  height: 40px;
}
.markdown-document table.table thead th {
  padding: 6px;
}
.markdown-document h1 {
  font-size: 1.5rem;
  margin-bottom: 24px;
  clear:both;
}

.markdown-document h2 {
  margin-top: 56px;
  font-size: 1.25rem;
  clear:both;
}

.markdown-document h3,
.markdown-document h4,
.markdown-document h5 {
  margin-top: 32px;
  margin-bottom: 18px;
  font-size: 1.125rem;
  clear:both;
}

.markdown-document ul,
.markdown-document ol
{
  margin-bottom: 18px;
}

.markdown-document code[class*="language-"]{
  font-family: Menlo,Monaco,Consolas,Courier New,Courier,monospace;
  line-height: 22.4px;
  margin: 16px 13px;
  font-size: 14px;
  border-radius: 8px;
}

.markdown-document code[class*="language-"] .token{
  background: none;
}

.markdown-document pre[class*="language-"]{
  border-radius: 4px;
  border: none;
  background-color: #eee;
}

.markdown-document pre[class*="language-mustache"] .token.variable{
  color: #cd880c;
}

</style>

<template>
  <div v-html="svg" />
</template>

<script>
  import mermaid from 'mermaid';
  import requests from '@/helpers/requests';
  import DocMixin from './DocMixin';
  import mustache from 'mustache';

  mermaid.initialize({
    startOnLoad:true
  });  
  
  export default {
    name: 'DocMermaid',
    mixins: [DocMixin],
    data() {
      return {
        mermaid : null,
        svg: null,
        id: `mermaid-${(new Date()).getMilliseconds()}`
      };
    },
    mounted() {

    },
    methods: {
      refresh() {
        // Получаем шаблон документа
        setTimeout(() => {
          requests.request(this.url).then(({ data }) => {
            if (!data)
              this.mermaid = null;
            else if (this.isTemplate) {
              this.mermaid = mustache.render(data, this.source.dataset);
            } else
              this.mermaid = data;

            const cb = (svgGraph) => {
              this.svg = svgGraph;
            };
            mermaid.render('buffer', data, cb);

            /*
            this.$nextTick(() => {
              debugger;
              // eslint-disable-next-line no-console
              console.info('>>>>>>>>>', mermaid);
              mermaid.initialize({
                startOnLoad: true
              });
            });
            */
          }).catch((e) => {
            // eslint-disable-next-line no-console
            console.error(e, `Ошибка запроса [${this.url}]`, e);
          });
        }, 50);
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

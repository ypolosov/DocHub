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
</style>

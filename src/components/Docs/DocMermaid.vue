<template>
  <box>
    <div v-html="svg" />
  </box>
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
            let source = this.isTemplate 
              ? mustache.render(data, this.source.dataset) 
              : data;
            const cb = (svgGraph) => {
              this.svg = svgGraph;
            };
            mermaid.render('buffer', source, cb);
          }).catch((e) => this.error = e);
        }, 50);
        this.sourceRefresh();
      }
    }
  };
</script>

<style>
</style>

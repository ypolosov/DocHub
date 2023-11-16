<template>
  <div class="json-viewer-box">
    <json-viewer v-bind:value="data" v-bind:expand-depth="expandDepth" />
  </div>
</template>

<script>
  import JsonViewer from 'vue-json-viewer';
  import 'vue-json-viewer/style.css';

  export default {
    name: 'ResponseComponent',
    components: {JsonViewer},
    props: {
      data: {
        type: Object,
        required: true
      },
      autoExpand: {
        type: Boolean,
        required: true
      }
    },
    computed: {
      expandDepth() {
        return (this.autoExpand === true) ? 1000 : 1;
      }
    }
  };
</script>

<style>
  .json-viewer-box .jv-container .jv-code {
    padding: 0;
  }
  .json-viewer-box .jv-container.jv-light {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  }
</style>

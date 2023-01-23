<template>
  <pre class="language-json" tabindex="0">
    <code v-if="!isReload" class="language-json">
      {{ jsoncode }}
    </code>
  </pre>
</template>

<script>
  export default {
    name: 'JSONResult',
    props: {
      jsoncode: {
        type: [String, Object, Array, Number],
        default: ''
      } 
    },
    data() {
      return {
        isReload: true
      };
    },
    watch: {
      jsoncode() {
        this.reload();
      }
    },
    mounted() {
      this.reload();
    },
    methods: {
      reload() {
        this.isReload = true;
        this.$nextTick(() => {
          this.isReload = false;
          // eslint-disable-next-line no-undef
          this.$nextTick(() => Prism.highlightAll());
        });
      }
    }
  };
</script>

<style scoped>

</style>

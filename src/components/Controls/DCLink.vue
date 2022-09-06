<template>
  <span v-bind:class="$style.link" v-on:click="onClick">
    <slot />
  </span>
</template>

<script>

  export default {
    name: 'DCLink',
    props: {
      href: { type: String, default: '' },
      target: { type: String, default: '' }
    },
    data() {
      return {};
    },
    methods: {
      onClick() {
        const struct = (this.href || '').split(':/');
        if (this.href.includes('https://file+.vscode-resource.vscode-cdn.net')) {
          window.$PAPI.goto(this.href);
        } else if (struct[0] === 'plugin') {
          const url = new URL(this.href);
          window.$PAPI.goto(`plugin:${url.pathname}`, url.searchParams.get('entity'), url.searchParams.get('id'));
        } else if ((this.href || '').split(':/').length == 1) {
          this.$router.push({ path: this.href });
        } else {
          window.open(this.href, this.target || '_blank');
        }
      }
    }
  };
</script>

<style module>
  .link {
    cursor: pointer;
    color: #1976d2;
  }
</style>

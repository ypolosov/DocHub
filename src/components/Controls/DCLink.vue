<template>
  <a @click="onClick" :href="href" :target="target || '_blank'">
    <slot></slot>
  </a>
</template>

<script>

export default {
  name: 'DCLink',
  methods: {
    onClick(event) {
      const struct = (this.href || "").split(":/");
      if (struct[0] === "plugin") {
        const url = new URL(this.href);
        window.$PAPI.goto(`plugin:${url.pathname}`, url.searchParams.get("entity"), url.searchParams.get("id"));
        event.preventDefault();
        return false;
      } else if ((this.href || "").split(":/").length == 1) {
        event.preventDefault();
        this.$router.push({ path: this.href});
        return false;
      }
      return true;
    }
  },
  props: {
    href: String,
    target: String
  },
  data() {
    return {};
  }
};
</script>

<style scoped>


</style>

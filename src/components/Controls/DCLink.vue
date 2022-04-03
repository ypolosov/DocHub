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
      if ((this.href || "").split("://").length == 1) {
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

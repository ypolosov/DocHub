<template>
  <ul class="items">
    <li :class="{'item': true, 'selected' : item.selected}" v-for="item in items" :key="item.key">
      <v-icon class="expand-ico" v-if="item.items && item.items.length" @click="onExpand(item)">
        <template v-if="expands[item.key]">expand_more</template>
        <template v-else>chevron_right</template>
      </v-icon>
      <router-link v-if="item.link" :to="item.link">
        {{item.title}}
      </router-link>
      <template v-else>
        {{item.title}}
      </template>
      <template v-if="item.items && expands[item.key]">
        <tree-item :items="item.items"></tree-item>
      </template>
    </li>
  </ul>
</template>

<script>

const TreeItem = {
  name: 'TreeItem',
  mounted() {
    this.refreshExpand(this.items);
  },
  methods: {
    refreshExpand(items) {
      items.map((item) => {
        if (item.expand) 
          this.$set(this.expands, item.key, item);
      });
    },
    onExpand(item) {
      if (this.expands[item.key]) {
        this.$set(this.expands, item.key, false);
      } else {
        this.$set(this.expands, item.key, item);
      }
    }
  },
  computed: {
  },
  watch: {
    items(items) {
      this.refreshExpand(items);
    }
  },
  props: {
    items: Array,
  },
  data() {
    return {
      expands: {}
    };
  }
};

export default Object.assign(TreeItem, {
  components: {
    TreeItem
  }
})

</script>

<style scoped>

  .items {
    list-style-type: none;
    padding-left: 28px;
    font-size: 16px;
  }

  .expand-ico {
    margin-left: -28px;
  }

  .item {
    padding-left: 4px;
    padding-right: 4px;
    width: fit-content;
  }

  .item.selected {
    background: rgb(52, 149, 219);
  }

  .item.selected * {
    color: #fff !important;
  }

</style>

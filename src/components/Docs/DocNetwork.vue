<template>
  <div class="space" />
</template>

<script>

  import { Network , DataSet } from 'vis-network/standalone/umd/vis-network.min';
  import DocMixin from './DocMixin';

  export default {
    name: 'DocTable',
    mixins: [DocMixin],
    data() {
      return {
      };
    },
    computed: {
      netData() {
        return this.source?.dataset;
      },
      isTemplate() {
        return true;
      }
    },
    watch: {
      netData() {
        this.network && this.network.destroy();
        this.network = new Network(this.$el, {
          nodes: new DataSet(this.netData?.nodes || []),
          edges: new DataSet(this.netData?.edges || [])
        }, {
          physics: {
            // Even though it's disabled the options still apply to network.stabilize().
            enabled: true,
            solver: 'repulsion',
            repulsion: {
              //              nodeDistance: 200 // Put more distance between the nodes.
            }
          }          
        });

        // this.network.stabilize();
      }
    }
  };
</script>

<style scoped>

.space {
  height: 800px;
  width: 100%;
}

</style>

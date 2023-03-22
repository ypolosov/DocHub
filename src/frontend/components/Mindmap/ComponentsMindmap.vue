<template>
  <plantuml v-bind:uml="uml" style="min-height:100%" />
</template>

<script>
  import PlantUML from '@front/components/Schema/PlantUML.vue';
  import query from '@front/manifest/query';

  export default {
    name: 'ComponentsMindMap',
    components: {
      'plantuml' : PlantUML
    },
    props: {
      root: { type: String, default: '' }, // Корневой идентификатор
      links: {
        type: String,
        default: 'smart',
        validator: value => [
          'smart',
          'component',
          'context'
        ].indexOf(value) >= 0
      }
    },
    data() {
      return {
      };
    },
    asyncComputed: {
      async uml() {
        const nodes = await query.expression(query.archMindMapComponents(this.root)).evaluate() || [];
        let uml = '@startwbs\n* Архитектура\n';
        let prevStruct = [];
        nodes.map((node) => {
          uml += '**';
          let nsid = '';
          const makeTitle = (id, node) => {
            return node.link ? ` [[${node.link} ${node.title || id}]]\n` : ` ${node.title || id}\n`;
          };
          const struct = node.id.split('.');
          for (let i = 0; i < struct.length; i++) {
            if (prevStruct[i] === struct[i]) uml += '*';
            else if (i === struct.length - 1) {
              uml += makeTitle(node.id, node);
            } else {
              const id = `${nsid}${struct[i]}`;
              uml += makeTitle(id, { id, title: id, link: `/architect/components/${id}`} );
              for (let f = 0; f <= i + 2; f++) uml += '*';
            }
            nsid += `${struct[i]}.`;
          }
          prevStruct = struct;
        });
        uml += '@endwbs\n';
        return uml;
      }
    }
  };
</script>

<style scoped>


</style>

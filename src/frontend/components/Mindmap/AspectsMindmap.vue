<template>
  <plantuml v-bind:uml="uml" style="min-height:100%" />
</template>

<script>

  import PlantUML from '@front/components/Schema/PlantUML.vue';
  import query from '@front/manifest/query';

  export default {
    name: 'AspectsMindMap',
    components: {
      'plantuml' : PlantUML
    },
    props: {
      root: { type: String, default: '' } // Корневой идентификатор
    },
    data() {
      return {
      };
    },
    asyncComputed: {
      async uml() {
        const nodes = await query.expression(query.archMindMapAspects(this.root)).evaluate();
        let uml = '@startwbs\n* Аспекты\n';

        const appendNode = (before, current, title) => {
          let deep = '**';
          let isPrefix = true;
          const beforeStruct = before.split('.');
          const curentStruct = current.split('.');
          for (let i = 0; i < curentStruct.length; i++) {
            isPrefix = isPrefix && (beforeStruct[i] === curentStruct[i]);
            if (!isPrefix) {
              if (i === curentStruct.length - 1) {
                uml += `${deep} ${title}`;
              } else {
                const aspectID = curentStruct.slice(0, i + 1).join('.');
                uml += `${deep} ${aspectID}\n`;
              }
            }
            deep += '*';
          }
          uml += '\n';
        };

        let before = '';
        nodes && nodes.map((node) => {
          appendNode(before, node.id, node.title || node.id);
          before = node.id;
        });
        uml += '@endwbs\n';
        return uml;
      }
    }
  };
</script>

<style scoped>


</style>

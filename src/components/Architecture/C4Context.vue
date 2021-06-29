<template>
  <v-container
      fluid
      class="lighten-4"
  >
    <v-row dense>
      <v-col
          cols="12"
      >
        <img :src="svgURL" style="max-width: 100%">
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import plantUML from '../../helpers/plantuml'

export default {
  name: 'C4Context',
  methods: {
    toID (id) {
      return id.replaceAll('@', '_').replaceAll('-', '_');
    }
  },
  computed: {
    svgURL() {
      const namespaces = {};
      const connections = {};
      const components = this.$store.state.components;
      for (const id in components) {
        let namespace = id.split('@')[0];
        const componentId = this.toID(id);
        if (!namespaces[namespace]) {
          namespaces[namespace] = {};
        }
        namespaces[namespace][componentId] = components[id];

        let component = components[id];
        if (component.requires) {
          component.requires.map((require) => {
            namespace = require.id.split('@')[0];
            if (!namespaces[namespace]) {
              namespaces[namespace] = {};
            }
            const requireId = this.toID(require.id);
            if (!namespaces[namespace][requireId])
              namespaces[namespace][requireId] = {
                presentations: [
                  { level: 1 }
                ]
              };
            connections[`[${componentId}] -- [${requireId}]`] = require.description;
          });
        }
      }

      let uml = '@startuml\n';
      for (const namespace in namespaces) {
        uml += `cloud "${namespace}" {\n`;
        const components = namespaces[namespace];
        for (const id in components) {
          let component = components[id];
          if (component.presentations) {
            component.presentations.map((presentation) => {
              if (presentation.level === 1) {
                switch (presentation.view) {
                  case '@database':
                    uml += `database "${component.description || id}" as ${id}\n`;
                    break;
                  case '@queue':
                    uml += `queue "${component.description || id}" as ${id}\n`;
                    break;
                  default:
                    uml += `[${component.description || id}] as ${id}\n`;
                }
              }
            });
          }
        }
        uml += `}\n`;
      }

      for (const connection in connections) {
        uml += `${connection}: "${connections[connection]}"\n`
      }

      uml += '@enduml\n';
      // eslint-disable-next-line no-console
      console.info(uml);
      return plantUML.svgURL(uml);
    }
  },
  data() {
    return {};
  }
};
</script>

<style scoped>

</style>

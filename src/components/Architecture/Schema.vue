<template>
  <v-container fluid class="lighten-4">
    <v-row dense>
      <v-col cols="12">
        <object
            v-show="!isPreparing"
            type="image/svg+xml"
            :data="svgURL"
            style="max-width: 100%; min-height: 300px"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import plantUML from '../../helpers/plantuml'

export default {
  name: 'Schema',
  methods: {
    toID(id) {
      return id.replaceAll('@', '_').replaceAll('-', '_');
    },
    makeRef(type, id, title) {
      const url = (new URL(`/schema/${this.context}/components/${btoa(id)}`, location.origin)).toString();
      return `[[${url} ${title || id}]]`;
    }
  },
  computed: {
    isPreparing () {
      return this.$store.state.is_reloading;
    },
    svgURL() {
      const namespaces = {};
      const connections = {};

      const components = this.$store.state.components;
      const contextID = atob(this.context);
      const isSelfContext = contextID === 'self';
      const focusID = this.focus ? this.toID(atob(this.focus)) : null;
      const context = this.$store.state.contexts[contextID];
      for (const id in components) {
        const componentId = this.toID(id);

        // Если анализируем себя, пропускаем все кроме компонента в фокусе
        if (isSelfContext && (componentId !== focusID))
          continue;

        const component = components[id];

        (component.presentations || []).map((presentation) => {
          if (!isSelfContext && ([].concat(presentation.contexts || ['global']).indexOf(contextID) < 0))
            return;

          const namespace = id.split('@')[0];
          !namespaces[namespace] && (namespaces[namespace] = {});
          if (!namespaces[namespace][componentId]) {
            namespaces[namespace][componentId] = Object.assign({
              id,
              shape: component.shape || presentation.shape || 'component'
            }, components[id])
          }

          (presentation.requires || []).map((require) => {
            const namespace = require.id.split('@')[0];
            !namespaces[namespace] && (namespaces[namespace] = {});

            const requireId = this.toID(require.id);
            if (!namespaces[namespace][requireId]) {
              namespaces[namespace][requireId] = {
                id: require.id,
                shape: components[require.id] ? components[require.id].shape || 'component' : 'component',
                title: (components[require.id] && components[require.id].title) || require.id,
              }
            }
            connections[`[${componentId}] -- [${requireId}]`] = require.title;
          });
        });
      }

      let uml = '@startuml\n';
      if (focusID) {
        uml += 'skinparam useBetaStyle true\n';
        uml += '<style>\n.focus * {\nBackgroundColor Red\nFontColor White\nRoundCorner 10\n}\n</style>\n';
      }
      context && (uml += `title ${context.title || contextID}\n`);

      for (const namespace in namespaces) {
        uml += `cloud "${namespace}" {\n`;
        const components = namespaces[namespace];
        for (const id in components) {
          const component = components[id];
          const title = this.makeRef('component', component.id, component.title);
          uml += `${component.shape} "${title}" as ${id}`;
          focusID === id && (uml += ' <<focus>>');
          uml += '\n';
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
  props: {
    context: String,
    focus: String
  },
  data() {
    return {
      prepare: setTimeout(()=>{}, 1000)
    };
  }
};
</script>

<style scoped>

</style>

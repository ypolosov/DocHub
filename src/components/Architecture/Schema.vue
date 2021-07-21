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
import DSL from '!!raw-loader!./../../assets/dsl.txt'

export default {
  name: 'Schema',
  methods: {
    toID(id) {
      return id.replaceAll('@', '_').replaceAll('-', '_');
    },
    isFocused(id) {
      return this.focusIDs.indexOf(id) >= 0;
    },
    makeRef(type, id, title, context) {
      const url = (() => {
        switch (type) {
          case 'context':
            return (new URL(`/schema/${this.context}`, location.origin)).toString();
          case 'component':
            return (new URL(`/schema/${this.context}/components/${btoa(id)}`, location.origin)).toString();
          case 'aspect':
            return (new URL(`/schema/${this.context}/components/${btoa(context.componentID)}/aspect/${btoa(id)}`, location.origin)).toString();
        }
      })();
      return `[[${url} ${title || id}]]`;
    }
  },
  computed: {
    contextID () {
      return atob(this.context);
    },
    aspectID () {
      return atob(this.aspect);
    },
    focusIDs () {
      return (this.focus && atob(this.focus).split(';')) || [];
    },
    isPreparing () {
      return this.$store.state.is_reloading;
    },
    svgURL() {
      // eslint-disable-next-line no-console
      const namespaces = {};
      const connections = {};

      const components = this.$store.state.components;
      const aspects = this.$store.state.aspects;
      const context = this.contextID ? this.$store.state.contexts[this.contextID] : null;

      for (const id in components) {
        const componentId = this.toID(id);
        const component = components[id];

        // Если анализируем себя, пропускаем все кроме компонента в фокусе
        if ((this.contextID === 'self') && !this.isFocused(id))
          continue;

        // Если казан аспект, отражаем только компоненты включенные в него
        if (['all'].concat(component.aspects || []).indexOf(this.aspectID) < 0)
          continue;

        // Разбираем представления компонента в контекстах
        (component.presentations || []).map((presentation) => {
          if (['self'].concat(presentation.contexts || ['global']).indexOf(this.contextID) < 0)
            return;
          const namespace = id.split('@')[0];
          !namespaces[namespace] && (namespaces[namespace] = {});
          namespaces[namespace][componentId] = Object.assign(
              namespaces[namespace][componentId]
              || {
                id,
                entity: component.entity || presentation.entity || 'component'
              }, components[id]);

          (presentation.requires || []).map((require) => {
            const namespace = require.id.split('@')[0];
            !namespaces[namespace] && (namespaces[namespace] = {});

            const requireId = this.toID(require.id);
            if (!namespaces[namespace][requireId]) {
              namespaces[namespace][requireId] = {
                id: require.id,
                entity: components[require.id] ? components[require.id].entity || 'component' : 'component',
                title: (components[require.id] && components[require.id].title) || require.id,
              }
            }
            connections[`[${componentId}] -- [${requireId}]`] = require.title;
          });
        });
      }

      let uml = `@startuml\n${DSL}\n`;
      context && (uml += `title ${this.makeRef('context', this.contextID, context.title)}\n`);

      for (const namespace in namespaces) {
        uml += `cloud "${namespace}" {\n`;
        for (const id in namespaces[namespace]) {
          const component = namespaces[namespace][id];
          const title = this.makeRef('component', component.id, component.title);
          if (component.aspects) {
            uml += `${component.entity} ${id}`;
            this.isFocused(component.id) && (uml += ' <<focus>>');
            const aspectList = [];
            component.aspects.map((aspectID) => {
              let aspectTitle = this.makeRef(
                  'aspect',
                  aspectID,
                  aspects[aspectID] && aspects[aspectID].title || aspectID,
                  {componentID: component.id}
              );
              aspectTitle = this.isFocused(aspectID) ? `<b>${aspectTitle}</b>` : aspectTitle;
              aspectList.push(aspectTitle);
            });
            aspectList.length && (uml += `[\n<b>${title}</b>\n====\n* ${aspectList.join('\n----\n* ')}\n]`);
          } else {
            uml += `${component.entity} "${title}" as ${id}`;
            this.isFocused(component.id) && (uml += ' <<focus>>');
          }
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
    // Контекст отображения схемы
    context:{
      type: String,
      default: btoa('self') // По умолчанию контекст "личный"
    },
    // Аспект отображения
    aspect:{
      type: String,
      default: btoa('all') // По умолчанию рассматриваются все аспекты
    },
    // ID элемент фокуса
    focus: {
      type: String,
      default: null // По фокуса нет
    }
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

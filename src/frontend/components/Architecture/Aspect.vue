<template>
  <v-container grid-list-xl fluid style="height:auto">
    <empty v-if="isEmpty" />
    <v-layout v-else wrap>
      <v-flex xs12 md5 d-flex>
        <v-layout wrap>
          <v-container grid-list-xl fluid>
            <v-card>
              <v-card-title>
                <v-icon left>settings</v-icon>
                <span class="title">Сводка</span>
              </v-card-title>
              <v-card-text class="headline font-weight-bold">
                <v-list>
                  <v-list-item v-for="(item) in summary" v-bind:key="item.title" v-bind:link="!!item.link">
                    <v-list-item-content>
                      <v-list-item-subtitle v-text="item.title" />
                      <v-list-item-title>
                        <a v-if="isURL(item.content)" v-bind:href="item.content" target="_blank">{{ item.content }}</a>
                        <template v-else>{{ item.content }}</template>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
            <docs v-bind:subject="aspect" />
            <v-card v-if="components.length" class="card-item" xs12 md12>
              <v-card-title>
                <v-icon left>settings</v-icon>
                <span class="title">Встречается в компонентах</span>
              </v-card-title>
              <v-card-text class="headline font-weight-bold">
                <ul style="font-size: 16px">
                  <li v-for="(component) in components" v-bind:key="component.id">
                    <router-link v-bind:to="`/architect/components/${component.id}`">
                      {{ component.title.replace(/\n/g, ' ') }}
                    </router-link>
                  </li>
                </ul>
              </v-card-text>
            </v-card>
            <v-card class="card-item" xs12 md12>
              <v-card-title>
                <v-icon left>description</v-icon>
                <span class="title">Иерархия</span>
              </v-card-title>
              <v-card-text class="headline font-weight-bold">
                <aspects-mindmap v-bind:root="aspect" style="width: 100%" />
              </v-card-text>
            </v-card>
            <src-locations v-bind:locations="srcLocations" />

            <v-card
              v-for="widget in widgets.left"
              v-bind:key="widget.id"
              class="card-item"
              xs12
              md12>
              <v-card-title>
                <v-icon left>description</v-icon>
                <span class="title">{{ widget.title }}</span>
              </v-card-title>
              <entity
                entity="aspects"
                v-bind:presentation="widget.presentation"
                v-bind:params="widget.params" />
            </v-card>
          </v-container>
        </v-layout>
      </v-flex>
      <v-flex xs12 md7 d-flex>
        <tab-contexts
          v-if="contexts.length"
          style="width: 100%"
          v-bind:default-context="defaultContext"
          v-bind:contexts="contexts"
          d-flex />

        <v-card
          v-for="widget in widgets.right"
          v-bind:key="widget.id"
          class="card-item"
          xs12
          md7>
          <v-card-title>
            <v-icon left>description</v-icon>
            <span class="title">{{ widget.title }}</span>
          </v-card-title>
          <entity
            entity="aspects"
            v-bind:presentation="widget.presentation"
            v-bind:params="widget.params" />
        </v-card>
      </v-flex>

      <v-flex xs12 md12 d-flex>
        <v-card
          v-for="widget in widgets.fill"
          v-bind:key="widget.id"
          class="card-item"
          xs12
          md12>
          <v-card-title>
            <v-icon left>description</v-icon>
            <span class="title">{{ widget.title }}</span>
          </v-card-title>
          <entity
            entity="aspects"
            v-bind:presentation="widget.presentation"
            v-bind:params="widget.params" />
        </v-card>
      </v-flex>
    </v-layout>

    <div style="display: none" v-html="focusStyle" />
  </v-container>
</template>

<script>
  import query from '@front/manifest/query';
  import AspectsMindmap from '@front/components/Mindmap/AspectsMindmap.vue';
  import Empty from '@front/components/Controls/Empty.vue';
  import uri from '@front/helpers/uri';
  import html from '@front/helpers/html';
  import Entity from '@front/components/Entities/Entity.vue';

  import Docs from './tabs/Docs.vue';
  import TabContexts from './tabs/TabContext.vue';
  import SrcLocations from './tabs/SrcLocations.vue';

  export default {
    name: 'Aspect',
    components: {
      Docs,
      AspectsMindmap,
      TabContexts,
      Empty,
      SrcLocations,
      Entity
    },
    props: {
      aspect: { type: String, default: '' }
    },
    data() {
      return {};
    },
    asyncComputed: {
      async components() {
        return await query.expression(query.componentsForAspects(this.aspect)).evaluate(this.manifest) || [];
      },
      async defaultContext() {
        const contextId = await query.expression(query.defaultContextForAspect(this.aspect)).evaluate(this.manifest);

        return contextId ? this.contexts.find(i => i.id === contextId) : null;
      },
      async contexts() {
        return await query.expression(query.contextsForAspects(this.aspect)).evaluate(this.manifest) || [];
      },
      async summary() {
        return await query.expression(query.summaryForAspect(this.aspect)
          .evaluate(this.manifest) || []);
      }
    },
    computed: {
      isEmpty() {
        return !((this.manifest || {}).aspects || {})[this.aspect];
      },
      focusStyle() {
        return `
        <style>
          a[href$="${this.aspect}"] text {
            font-size: 14px;
            fill: #f00;
            font-weight: 600;
            text-decoration-line: underline;
          }
        </style>
      `;
      },
      srcLocations() {
        return html.collectLocationElement({
          expression: query.locationsForAspect(this.aspect),
          context: this.$store.state.sources,
          id: this.aspect,
          entity: 'aspect'
        });
      },
      // Генерируем данные о фиджетах
      widgets() {
        const result = {
          left: [],   // Виджеты с прижатием налево
          right: [],  // Виджеты с прижатием направо
          fill: []    // Виджеты во всю ширину
        };
        const widgets = (query.expression(query.widgetsForAspect()).evaluate(this.manifest) || {});
        for (const id in widgets) {
          let wiget = widgets[id];
          wiget.id = `${wiget.id}-${this.aspect}`;
          wiget.params = Object.assign(wiget.params || {}, {aspect: this.aspect});
          switch(wiget.align) {
            case '<': result.left.push(wiget); break;
            case '>': result.right.push(wiget); break;
            default: result.fill.push(wiget); break;
          }
        }
        return result;
      }
    },
    methods: {
      isURL(str) {
        return uri.isURL(str);
      }
    }
  };
</script>

<style scoped>
.card-item {
  width: 100%;
  margin-top: 12px;
}
</style>

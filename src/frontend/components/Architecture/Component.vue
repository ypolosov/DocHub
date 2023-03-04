<template>
  <v-container grid-list-xl fluid style="height:auto">
    <div style="display: none" v-html="focusStyle" />
    <empty v-if="isEmpty" />
    <template v-else>
      <v-layout wrap>
        <v-flex xs12 md5 d-flex style="padding-top: 0">
          <v-layout wrap>
            <v-container grid-list-xl fluid style="padding-top: 0">
              <v-card class="card-item" xs12 md12>
                <v-card-title>
                  <v-icon left>settings</v-icon>
                  <span class="title">Сводка</span>
                </v-card-title>

                <v-card-text class="headline font-weight-bold">
                  <v-list>
                    <v-list-item v-for="(item) in summary" v-bind:key="item.title" v-bind:link="!!item.link">
                      <v-list-item-content v-on:click="goToLink(item.link)">
                        <v-list-item-subtitle v-text="item.title" />

                        <v-list-item-title>
                          <v-icon v-if="item.required && !item.content" left color="red">error</v-icon>
                          <a v-else-if="isURL(item.content)" v-bind:href="item.content" target="_blank">{{ item.content }}</a>
                          <a v-else-if="item.onclick" v-on:click="item.onclick">{{ item.content }}</a>
                          <span v-else>{{ item.content }}</span>
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>

              <docs v-bind:subject="component" />

              <v-card class="card-item" xs12 md12>
                <v-card-title>
                  <v-icon left>description</v-icon>
                  <span class="title">Иерархия</span>
                </v-card-title>
                <v-card-text class="headline font-weight-bold">
                  <components-mindmap v-bind:root="component" links="component" />
                </v-card-text>
              </v-card>

              <src-locations v-bind:locations="srcLocations" />

              <v-card
                v-for="widget in widgets?.left || []"
                v-bind:key="widget.id"
                class="card-item"
                xs12
                md12>
                <v-card-title>
                  <v-icon left>description</v-icon>
                  <span class="title">{{ widget.title }}</span>
                </v-card-title>
                <entity
                  entity="components"
                  v-bind:presentation="widget.presentation"
                  v-bind:params="widget.params" />
              </v-card>
            </v-container>
          </v-layout>
        </v-flex>

        <v-flex xs12 md7 d-flex>
          <v-layout wrap>
            <tab-contexts
              v-if="contexts?.length"
              style="width: 100%"
              v-bind:contexts="contexts"
              v-bind:manifest="manifest"
              d-flex />

            <v-card
              v-for="widget in widgets?.right || []"
              v-bind:key="widget.id"
              class="card-item"
              xs12
              md7>
              <v-card-title>
                <v-icon left>description</v-icon>
                <span class="title">{{ widget.title }}</span>
              </v-card-title>
              <entity
                entity="components"
                v-bind:presentation="widget.presentation"
                v-bind:params="widget.params" />
            </v-card>
          </v-layout>
        </v-flex>
      </v-layout>
      <v-layout v-if="widgets?.fill?.length" wrap style="height: auto">
        <v-card
          v-for="widget in widgets?.fill || []"
          v-bind:key="widget.id"
          class="card-item"
          xs12
          md12>
          <v-card-title>
            <v-icon left>description</v-icon>
            <span class="title">{{ widget.title }}</span>
          </v-card-title>
          <entity
            entity="components"
            v-bind:presentation="widget.presentation"
            v-bind:params="widget.params" />
        </v-card>
      </v-layout>
    </template>
  </v-container>
</template>

<script>
  import query from '@front/manifest/query';
  import ComponentsMindmap from '@front/components/Mindmap/ComponentsMindmap';
  import Empty from '@front/components/Controls/Empty.vue';
  import uri from '@front/helpers/uri';
  import entity from '@front/components/Entities/Entity.vue';
  import html from '@front/helpers/html';

  import TabContexts from './tabs/TabContext.vue';
  import SrcLocations from './tabs/SrcLocations.vue';
  import Docs from './tabs/Docs.vue';

  export default {
    name: 'ArchComponent',
    components: {
      Docs,
      ComponentsMindmap,
      TabContexts,
      Empty,
      SrcLocations,
      entity
    },
    props: {
      component: { type: String, default: '' }
    },
    data() {
      return {
        currentContext: 0
      };
    },
    asyncComputed: {
      async contexts() {
        return [{
          id: this.component,
          title: 'SELF',
          type: 'component'
        }].concat(await query.expression(query.contextsForComponent(this.component))
          .evaluate() || []);
      },
      async summary() {
        return await query.expression(query.summaryForComponent(this.component))
          .evaluate() || [];
      },
      // Генерируем данные о фиджетах
      async widgets() {
        const result = {
          left: [],   // Виджеты с прижатием налево
          right: [],  // Виджеты с прижатием направо
          fill: []    // Виджеты во всю ширину
        };
        const widgets = await query.expression(query.widgetsForComponent()).evaluate() || {};
        for (const id in widgets) {
          let wiget = widgets[id];
          wiget.id = `${this.component}-${wiget.id}`;
          wiget.params = Object.assign(wiget.params || {}, {component: this.component});
          switch(wiget.align) {
            case '<': result.left.push(wiget); break;
            case '>': result.right.push(wiget); break;
            default: result.fill.push(wiget); break;
          }
        }
        return result;
      },
      async srcLocations() {
        return await html.collectLocationElement({
          expression: query.locationsForComponent(this.component),
          context: this.$store.state.sources,
          id: this.component,
          entity: 'component'
        });
      }
    },
    computed: {
      isEmpty() {
        return !((this.manifest || {}).components || {})[this.component];
      },
      focusStyle() {
        return `
        <style>
          a[href$="${this.component}"] text {
            font-size: 14px;
            fill: #f00;
            font-weight: 600;
            text-decoration-line: underline;
          }
        </style>
      `;
      }
    },
    methods: {
      isURL(str) {
        return uri.isURL(str);
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      goToLink() {

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

<template>
    <v-list dense class="grey lighten-4" v-model="selected">
      <template v-for="(item, i) in menu">
        <v-list-item :class="{ 'menu-item' : true, 'menu-item-selected': isMenuItemSelected(item) }"
            :key="i" :style="{'padding-left': '' + (item.level * 8) + 'px'}"
        >
          <v-list-item-action class="menu-item-action">
            <v-icon v-if="item.isGroup" @click="onClickMenuExpand(item)">
              <template v-if="item.isExpanded">expand_more</template>
              <template v-else>chevron_right</template>
            </v-icon>
          </v-list-item-action>
          <v-list-item-action>
            <v-icon>{{item.icon}}</v-icon>
          </v-list-item-action>
          <v-subheader class="menu-item-header" @click="onClickMenuItem(item)">
            {{ item.title }}
          </v-subheader>
        </v-list-item>
      </template>
    </v-list>
</template>

<script>

import jsonata from 'jsonata';
import manifest_parser from "../helpers/manifest_parser";

export default {
  name: 'Menu',
  mounted () {
    // После загрузки отключаем переход при навигации
    const timer = setInterval(() => {
      if (!this.$store.state.is_reloading) {
        this.isRouting = false;
        clearInterval(timer);
      }
    }, 50)
  },
  methods: {
    isMenuItemSelected (item) {
      return item.route === this.currentRoute;
    },
    onClickMenuExpand(item) {
      this.$set(this.expands, item.location, !this.expands[item.location]);
      this.isRouting = false;
    },

    onClickMenuItem(item) {
      this.selected = item.route;
      if (item.route)
        this.$router.push({ path: item.route });
      else
        this.onClickMenuExpand(item);
    },

    getLevel (item) {
      return item.route.split('/').length;
    },
  },
  computed: {
    menu () {
      const result = [];
      const expand = (node, location) => {
        for (const key in node.items) {
          const item = node.items[key];
          const itemLocation = (location || []).concat([key]);
          const menuItem = {
            title: item.title,
            route: item.route,
            icon: item.icon,
            level: itemLocation.length - 1,
            location: itemLocation.join('/')
          };
          result.push(menuItem);
          if (Object.keys(item.items).length) {
            menuItem.isGroup = true;
            if (this.expands[menuItem.location]) {
              menuItem.isExpanded = true;
              expand(item, itemLocation);
            }
          }
        }
      }
      expand(this.treeMenu);
      return result;
    },

    treeMenu () {
      const result = { items: {} };
      (jsonata(`
        (
            $MANIFEST := $;
            [
                {
                    "title": 'Архитектура',
                    "route": 'architect',
                    "expand": true,
                    "icon": 'home'
                },
                {
                    "title": "Контексты",
                    "route": 'architect/contexts',
                    "icon": 'location_searching'
                },
                {
                    "title": "Аспекты",
                    "route": 'architect/aspects',
                    "icon": 'visibility'
                },
                {
                    "title": 'Документы',
                    "route": 'docs',
                    "expand": true,
                    "icon": 'description'
                },
                contexts.$spread().(
                    $CONTEXT := $lookup($MANIFEST.contexts, $keys()[0]);
                    {
                      "title": $CONTEXT.title,
                      "route": 'architect/contexts/' & $keys()[0],
                      "icon": $CONTEXT.icon ? $CONTEXT.icon : ''
                    }
                ),
                aspects.$spread().{
                    "title": $.*.title,
                    "icon": $.*.icon ? $.*.icon : '',
                    "route": 'architect/aspects/' & $keys()[0]
                },
                docs.$spread().{
                    "title": $.*.description,
                    "route": 'docs/' & $keys()[0],
                    "location": 'docs/' & $.*.location,
                    "icon": $.*.icon ? $.*.icon : ''
                }
            ]
        ).{
            "title": title,
            "route": '/' & route,
            "icon": icon,
            "location": location ? location : route
        }
      `).evaluate(this.$store.state.manifest[manifest_parser.MODE_AS_IS]) || []).map((item) => {
        const location = item.location.split('/');
        let node = result;
        let key = null;
        for(let i = 0; i < location.length; i++) {
          key = location[i];
          !node.items[key] && (node.items[key] = { title: key, items: {} });
          node = node.items[key];
        }
        node.title = item.title;
        node.route = item.route;
        node.icon = item.icon;

        if (this.isRouting && (node.route === this.currentRoute)) {
          this.$nextTick(() => {
            let subLocation = null;
            location.map((item) => {
              subLocation = subLocation ? `${subLocation}/${item}` : item;
              if (!this.expands[subLocation])
                this.$set(this.expands, subLocation, true)
            });
          });
        }
      });

      return result;
    },

    currentRoute () {
      return this.selected || window.location.pathname;
    }
  },
  data() {
    return {
      // Выбранный элемент меню
      selected: null,
      // Переход по роуту
      isRouting: true,
      // Открытые пункты меню
      expands: {
        architect: true,
        docs: true
      }
    };
  }
};
</script>

<style>
  .menu-item {
    min-height: 20px !important;
  }

  .menu-item-action {
    padding: 0;
    margin: 2px !important;
  }

  .menu-item-header {
    line-height: 14px;
    cursor: pointer;
  }

  .menu-item-selected {
    background: rgb(52, 149, 219);
  }

  .menu-item-selected * {
    color: #fff !important;
  }

</style>

<template>
  <div>
    <v-navigation-drawer
      ref="drawer"
      v-model="showMenuSync"
      absolute
      temporary
      color="grey lighten-4">
      <v-list dense class="grey lighten-4">
        <template v-for="(item, i) in items">
          <v-list-item
            v-if="(item.route !== '/problems') || (problems.length)"
            v-bind:key="i"
            v-bind:class="{ 'menu-item' : true, 'menu-item-selected': isMenuItemSelected(item) }"
            v-bind:style="{'padding-left': '' + (item.level * 8) + 'px'}">
            <v-list-item-action class="menu-item-action">
              <v-icon v-if="item.isGroup" v-on:click="onClickMenuExpand(item)">
                <template v-if="item.isExpanded">mdi-chevron-down</template>
                <template v-else>mdi-chevron-right</template>
              </v-icon>
            </v-list-item-action>
            <v-subheader
              v-if="item.route === '/problems'"
              class="menu-item-header error--text"
              v-on:click="onClickMenuItem(item)">
              {{ item.title }} ({{ problemsCount }})
            </v-subheader>
            <v-subheader
              v-else
              class="menu-item-header"
              v-on:click="onClickMenuItem(item)">
              {{ item.title }}
            </v-subheader>
            <v-list-item-action v-if="item.icon" class="menu-item-action menu-item-ico">
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
  import query from '@/manifest/query';

  export default {
    props: {
      showMenu: { type: Boolean, default: false }
    },
    data() {
      return {
        currentRoute: window.location.pathname,
        expands: {
          architect: true,
          docs: true
        }
      };
    },
    computed: {
      // Выясняем сколько значимых отклонений зафиксировано
      // исключения не учитываем
      showMenuSync: {
        get() {
          return this.showMenu;
        },
        set(value) {
          this.$emit('update:show-menu', value);
        }
      },  
      problemsCount() {
        let result = 0;
        this.problems.map((validator) => {
          (validator.items || []).map((problem) => 
            !((this.manifest.rules || {}).exceptions || {})[problem.uid] && result ++
          );
        }); 
        return result;
      },
      problems() {
        return this.$store.state.problems || [];
      },
      items() {
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
        };
        expand(this.treeMenu);
        return result;
      },
      treeMenu() {
        const result = { items: {} };
        (query.expression(query.menu()).evaluate(this.manifest) || []).map((item) => {
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
          if (node.route === this.currentRoute) {
            this.$nextTick(() => {
              let subLocation = null;
              location.map((item) => {
                subLocation = subLocation ? `${subLocation}/${item}` : item;
                if (!this.expands[subLocation]) {
                  this.$set(this.expands, subLocation, true);
                }
              });
            });
          }
        });

        return result;
      }
    },
    watch: {
      $route(to) {
        this.currentRoute = to.path;
      }
    },
    methods: {
      isMenuItemSelected(item) {
        return item.route === this.currentRoute;
      },
      onClickMenuExpand(item) {
        this.$set(this.expands, item.location, !this.expands[item.location]);
      },
      onClickMenuItem(item) {
        if (item.route) {
          this.$router.push({ path: item.route });
        } else {
          this.onClickMenuExpand(item);
        }
      },
      getLevel(item) {
        return item.route.split('/').length;
      }
    }
  };
</script>

<template>
  <v-navigation-drawer
    ref="drawer"
    v-model="showMenuSync"
    app
    clipped
    width="350"
    temporary>
    <div>
      <div v-for="(item, i) in sortedMenu" v-bind:key="i">
        <div
          v-if="item.route === '/problems'"
          class="menu-item-header error--text pl-2"
          v-on:click="onClickMenuItem(item)">
          <span>{{ item.title }} ({{ problemsCount }})</span>
        </div>
            
        <div
          v-else
          class="menu-item"
          v-bind:class="{ 
            'menu-item-selected': isMenuItemSelected(item) 
          }"
          v-bind:style="{
            'padding-left': `${item.level * 8}px`
          }">
          <v-icon v-if="item.isGroup" class="menu-item-action mx-1" v-on:click="onClickMenuExpand(item)">
            {{ item.isExpanded ? 'mdi-folder-open' : 'mdi-folder' }}
          </v-icon>
          <div v-else class="ml-8" />
            
          <div
            class="menu-item-header"
            v-on:click="onClickMenuItem(item)">
            {{ item.title }}
              
            <!-- <v-icon v-if="item.icon" class="ml-auto">{{ item.icon }}</v-icon> -->
          </div>
        </div>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script>
  import query from '@/manifest/query';
  import { throttle } from '@/vscode/helpers/common';

  export default {
    props: {
      showMenu: { type: Boolean, default: false }
    },
    data() {
      return {
        // Открытые пункты меню
        tree: null,
        currentRoute: window.location.pathname,
        expands: {
          architect: true,
          docs: true
        },
        throttledCreateTree: throttle(this.createTree, 500)
      };
    },
    computed: {
      sortedMenu() {
        const menu = this.menu;

        return menu.sort((a) => {
          if (a.title === 'Проблемы') {
            return 1;
          }

          return 0;
        });
      },
      isReloading() {
        return this.$store.state.isReloading;
      },
      showMenuSync: {
        get() {
          return this.showMenu;
        },
        set(value) {
          this.$emit('update:show-menu', value);
        }
      },
      // Выясняем сколько значимых отклонений зафиксировано
      // исключения не учитываем
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
      menu() {
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

        expand(this.tree);

        // const compare = (a) => {
        //   if (a.title === 'Проблемы') {
        //     return 1;
        //   }

        //   return 0;
        // }


        return result;
      }
    },
    watch: {
      $route(to) {
        this.currentRoute = to.path;
      },
      isReloading(value) {
        if (!value) {
          setTimeout(this.throttledCreateTree, 150);
        }
      }
    },
    created() {
      this.createTree();
    },
    methods: {
      createTree(){
        const result = { items: {} };
        const menu = query.expression(query.menu()).evaluate(this.manifest) || [];

        menu.map(({ location, title, route, icon }) => {
          const subLocations = location.split('/');
          let node = result;

          for(let i = 0; i < subLocations.length; i++) {
            const key = subLocations[i];
            node.items[key] = node.items[key] 
              || { 
                title, 
                route,
                icon,
                items: {}
              };
            
            node = node.items[key];
          }

          if (node.route === this.currentRoute) {
            this.$nextTick(() => {
              let subLocation = null;
              subLocations.map((item) => {
                subLocation = subLocation ? `${subLocation}/${item}` : item;

                if (!this.expands[subLocation])
                  this.$set(this.expands, subLocation, true);
              });
            });
          }
        });

        this.tree = result;
      },
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

<style scoped>
  .menu-item {
    align-items: center;
    display: flex;
    width: 100%;
  }

  .menu-item-action {
    padding: 0;
    margin: 2px !important;
  }

  .menu-item-ico {
    position: absolute;
    right: 4px;
  }

  .menu-item-header {
    align-items: center;
    display: flex;
    line-height: 14px;
    height: 32px !important;
    cursor: pointer;
    width: 100%;
  }

  .menu-item-selected {
    background: rgb(52, 149, 219);
  }

  .menu-item-selected * {
    color: #fff !important;
  }

</style>

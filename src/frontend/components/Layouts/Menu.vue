<template>
  <v-list dense class="grey lighten-4">
    <v-list-item>
      <v-text-field
        dense
        clearable
        v-on:input="inputFilter">
        <v-icon
          slot="append">
          mdi-magnify
        </v-icon>
      </v-text-field>      
    </v-list-item>
    <template v-for="(item, i) in menu">
      <v-list-item
        v-if="(item.route !== '/problems') || (problems.length)"
        v-bind:key="i"
        v-bind:class="{ 'menu-item' : true, 'menu-item-selected': isMenuItemSelected(item) }"
        v-bind:style="{'padding-left': '' + (item.level * 8) + 'px'}">
        <v-list-item-action class="menu-item-action">
          <v-icon v-if="item.isGroup" v-on:click="onClickMenuExpand(item)">
            <template v-if="isExpandItem(item)">expand_more</template>
            <template v-else>chevron_right</template>
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
</template>

<script>

  import uri from '@front/helpers/uri';
  import query from '@front/manifest/query';

  export default {
    name: 'Menu',
    data() {
      return {
        // Открытые пункты меню
        currentRoute: this.$router.currentRoute,
        filter: {
          text: '',
          query: '',
          timer: null
        },
        menuCache: null,
        expands: {
          architect: true,
          docs: true
        }
      };
    },
    asyncComputed: {
      async treeMenu() {
        const result = { items: {} };

        const dataset = (this.menuCache ? this.menuCache : await query.expression(query.menu()).evaluate()) || [];
        !this.menuCache && this.$nextTick(() => this.menuCache = dataset);

        dataset.map((item) => {
          if (!this.isInFilter(item.location)) return;
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
          if ((node.route === this.currentRoute.fullPath) || (node.route === this.currentRoute.path)) {
            this.$nextTick(() => {
              let subLocation = null;
              location.map((item) => {
                subLocation = subLocation ? `${subLocation}/${item}` : item;
                if (!this.expands[subLocation])
                  this.$set(this.expands, subLocation, true);
              });
            });
          }
        });

        return result;
      }
    },
    computed: {
      // Выясняем сколько значимых отклонений зафиксировано
      // исключения не учитываем
      problemsCount() {
        let result = 0;
        this.problems.map((validator) => {
          (validator.items || []).map((problem) =>
            !problem.exception && result ++
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
              if (this.expands[menuItem.location] || this.filter.query) {
                expand(item, itemLocation);
              }
            }
          }
        };
        
        this.treeMenu && expand(this.treeMenu);
        
        return result;
      }
    },
    watch: {
      manifest() {
        this.menuCache = null;
      },
      $route(to) {
        this.currentRoute = to;
      },
      'filter.text'(value) {
        if (this.filter.timer) clearTimeout(this.filter.timer);
        const len = (this.menuCache || []).length;
        let sens = 50;
        if (len > 1000) sens = 500;
        else if (len > 500) sens = 300;
        this.filter.timer = setTimeout(() => {
          this.filter.query = value && value.length > 1 ? value.toLocaleLowerCase() : '';
        }, sens);
      }
    },
    methods: {
      isExpandItem(item) {
        return this.expands[item.location];
      },
      // Прокладка сделана т.к. инпут с v-model тупит при большом меню
      inputFilter(text) {
        this.filter.text = text;
      },
      isInFilter(text) {
        if (!this.filter.query) return true;
        const struct = this.filter.query.split(' ');
        const request = text.toLocaleLowerCase();
        for (let i = 0; i < struct.length; i++) {
          if (struct[i] && (request.indexOf(struct[i]) < 0)) return false;
        }
        return true;
      },      
      isMenuItemSelected(item) {
        return (item.route === this.currentRoute.fullPath) || (item.route === this.currentRoute.path);
      },
      onClickMenuExpand(item) {
        this.$set(this.expands, item.location, !this.expands[item.location]);
      },
      onClickMenuItem(item) {
        if (item.route)
          if (uri.isExternalURI(item.route)) {
            window.open(item.route, '_blank');
          } else {
            this.$router.push({ path: item.route }).catch(()=> null);
          }
        else
          this.onClickMenuExpand(item);
      },
      getLevel(item) {
        return item.route.split('/').length;
      }
    }
  };
</script>

<style scoped>
  .menu-item {
    min-height: 20px !important;
    margin-top: 2px;
    margin-bottom: 2px;
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
    line-height: 14px;
    height: 32px !important;
    cursor: pointer;
  }

  .menu-item-selected {
    background: rgb(52, 149, 219);
  }

  .menu-item-selected * {
    color: #fff !important;
  }

</style>

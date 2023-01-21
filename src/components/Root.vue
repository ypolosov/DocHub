<template>
  <v-app
    id="keep"
    v-bind:class="{'no-select-text': isDrawerResize}">
    <v-app-bar
      app
      clipped-left
      color="#3495db"
      dark
      style="z-index: 99">
      <v-btn v-if="isBackShow" icon v-on:click="back">
        <v-icon>arrow_back</v-icon>
      </v-btn>
      <v-app-bar-nav-icon v-on:click="drawer = !drawer">
        <header-logo />
      </v-app-bar-nav-icon>
      <v-toolbar-title style="cursor: pointer" v-on:click="onLogoClick">DocHub</v-toolbar-title>
      <v-spacer />
      <v-btn v-if="isSearchInCode" icon title="Найти в коде" v-on:click="gotoCode">
        <v-icon class="material-icons" style="display: inline">search</v-icon>
      </v-btn>
      <!--
        <v-btn icon title="Стравнить">
          <v-icon>mdi-call-split</v-icon>
        </v-btn>
      -->
    </v-app-bar>
    <v-navigation-drawer
      ref="drawer"
      v-model="drawer"
      v-bind:width="width"
      app
      clipped
      color="grey lighten-4"
      style="z-index: 999">
      <menu-component />
    </v-navigation-drawer>
    <plugin-init v-if="isNotInited" />
    <v-content v-else style="min-height:100%" class="router-view">
      <problems v-if="isCriticalError" />
      <router-view v-else />
    </v-content>
    <template v-if="isLoading">
      <div class="loading-splash" />
      <v-progress-circular
        class="whell"
        v-bind:size="64"
        v-bind:width="7"
        v-bind:value="60"
        color="primary"
        indeterminate />
    </template>
  </v-app>
</template>

<script>

  import MenuComponent from './Layouts/Menu';
  import HeaderLogo from './Layouts/HeaderLogo';
  import PluginInit from '../idea/components/Init.vue';
  import Problems from './Problems/Problems.vue';
  import env, {Plugins} from '@/helpers/env';

  const minDrawerSize = 200;
  const defaultDrawerSize = 300;

  export default {
    name: 'Root',
    components: {
      HeaderLogo,
      MenuComponent,
      PluginInit,
      Problems
    },
    data() {
      return {
        drawer: null,
        isDrawerResize: false,
        width: defaultDrawerSize,
        isPlugin: env.isPlugin(),
        isSearchInCode: env.isPlugin(Plugins.idea),
        isBackShow: env.isPlugin(Plugins.vscode)
      };
    },
    computed: {
      isLoading() {
        return this.$store.state.isReloading;
      },
      isNotInited() {
        return this.isPlugin && this.$store.state.notInited;
      },
      isCriticalError() {
        return this.isPlugin && this.$store.state.criticalError;
      }
    },
    mounted() {
      const el = this.$refs.drawer.$el;
      const drawerBorder = document.querySelector('.v-navigation-drawer__border');

      function resize(e) {
        document.body.style.cursor = 'ew-resize';
        if (e.clientX < minDrawerSize) return;
        el.style.width = `${e.clientX}px`;
      }

      drawerBorder && drawerBorder.addEventListener(
        'mousedown',
        (e) => {
          if (e.offsetX < minDrawerSize) {
            el.style.transition = 'initial';
            document.addEventListener('mousemove', resize, false);
            this.isDrawerResize = true;
          }
        },
        false
      );

      document.addEventListener(
        'mouseup',
        () => {
          el.style.transition = '';
          this.width = el.style.width;
          document.body.style.cursor = '';
          document.removeEventListener('mousemove', resize, false);
          this.isDrawerResize = false;
        },
        false
      );
    },
    methods: {
      back() {
        this.$router.back();
      },
      onLogoClick() {
        if (this.isPlugin) {
          window.open('https://dochub.info', '_blank');
        } else {
          this.$router.push({name: 'main'}).catch(() => null);
        }
      },
      gotoCode() {
        // eslint-disable-next-line no-console
        // console.info('For GOTO ', window.location.hash);
        const struct = window.location.hash.split('/');
        switch (struct[1]) {
          case 'architect': {
            switch (struct[2]) {
              case 'contexts': 
                window.$PAPI.goto(null, 'context', struct[3]); 
                break;
              case 'aspects': 
                window.$PAPI.goto(null, 'aspect', struct[3]); 
                break;
              case 'components': 
                window.$PAPI.goto(null, 'component', struct[3]); 
                break;
            }
            break;
          }
          case 'docs': 
            window.$PAPI.goto(null, 'document', struct[2]); 
            break;
        }
      }
    }
  };
</script>

<style>
@import '~vuetify/dist/vuetify.min.css';
@import '~swagger-ui/dist/swagger-ui.css';

.swagger-ui {
  width: 100%;
}

.router-view > div > div {
  height: 100%;
}

.router-view > div > div > div {
  height: 100%;
}

.v-navigation-drawer__border {
  width: 3px !important;
  cursor: col-resize !important;
  background: #ccc !important;
}

.no-select-text * {
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}

.loading-splash {
  background: #FFF;
  opacity: 0.7;
  z-index: 10;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  filter: blur(8px);
  -webkit-filter: blur(8px);
}

.whell {
  z-index: 100;
  left: 50%;
  top: 50vh;
  position: absolute !important;
  margin-left: -32px;
  margin-top: -32px;
}

</style>

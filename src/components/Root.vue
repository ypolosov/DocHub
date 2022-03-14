<template>
  <v-app id="keep"
         :class="{'no-select-text': isDrawerResize}"
  >
    <v-app-bar
        app
        clipped-left
        color="#3495db"
        dark
    >
      <v-app-bar-nav-icon @click="drawer = !drawer">
        <div
            style="padding:4px; background: #fff; border-radius: 17px;"
        >
          <svg
              width="24px"
              height="24px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style="background: #fff; border-radius: 3px;"
          >
            <path
                d="M14.5264 23.5895C19.2934 23.5895 23.1579 19.725 23.1579 14.9579C23.1579 10.1908 19.2934 6.32629 14.5264 6.32629C9.75927 6.32629 5.89478 10.1908 5.89478 14.9579C5.89478 19.725 9.75927 23.5895 14.5264 23.5895Z"
                fill="#3495DB"></path>
            <path opacity="0.9" fill-rule="evenodd" clip-rule="evenodd"
                  d="M9.05263 18.1053C14.0523 18.1053 18.1053 14.0523 18.1053 9.05263C18.1053 4.053 14.0523 0 9.05263 0C4.053 0 0 4.053 0 9.05263C0 14.0523 4.053 18.1053 9.05263 18.1053ZM9.05263 15.7035C12.7259 15.7035 15.7035 12.7259 15.7035 9.05263C15.7035 5.37945 12.7259 2.40172 9.05263 2.40172C5.37945 2.40172 2.40172 5.37945 2.40172 9.05263C2.40172 12.7259 5.37945 15.7035 9.05263 15.7035Z"
                  fill="#081935"></path>
          </svg>
        </div>
      </v-app-bar-nav-icon>
      <v-toolbar-title style="cursor: pointer" @click="$router.push({name: 'main'})">DocHub</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="isPlugin" icon title="Отладка" @click="showDebugger">
        <v-icon>adjust</v-icon>
      </v-btn>
      <v-btn icon title="Обновить" @click="reloadManifests">
        <v-icon>refresh</v-icon>
      </v-btn>
      <!--
      <v-btn icon title="Стравнить">
        <v-icon>mdi-call-split</v-icon>
      </v-btn>
      -->
    </v-app-bar>
    <v-navigation-drawer
        ref="drawer"
        :width="width"
        v-model="drawer"
        app
        clipped
        color="grey lighten-4">
      <Menu></Menu>
    </v-navigation-drawer>
    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>

import Menu from "./Menu";

const minDrawerSize = 200;
const defaultDrawerSize = 300;

export default {
  name: 'Root',
  components: {
    Menu
  },
  mounted() {
    const el = this.$refs.drawer.$el;
    const drawerBorder = document.querySelector(".v-navigation-drawer__border");

    function resize(e) {
      document.body.style.cursor = "ew-resize";
      if (e.clientX < minDrawerSize) return;
      el.style.width = `${e.clientX}px`;
    }

    drawerBorder.addEventListener(
        "mousedown",
        (e) => {
          if (e.offsetX < minDrawerSize) {
            el.style.transition = "initial";
            document.addEventListener("mousemove", resize, false);
            this.isDrawerResize = true;
          }
        },
        false
    );

    document.addEventListener(
        "mouseup",
        () => {
          el.style.transition = "";
          this.width = el.style.width;
          document.body.style.cursor = "";
          document.removeEventListener("mousemove", resize, false);
          this.isDrawerResize = false;
        },
        false
    );
  },
  methods: {
    reloadManifests() {
      this.$store.dispatch('reloadAll')
    },
    showDebugger() {
      window.$PAPI.showDebugger();
    }
  },
  data() {
    return {
      drawer: null,
      isDrawerResize: false,
      width: defaultDrawerSize,
      isPlugin: process.env.VUE_APP_DOCHUB_MODE === "plugin"
    };
  }
};
</script>

<style>
@import '../assets/material_icons.css';
@import '~vuetify/dist/vuetify.min.css';
@import '~swagger-ui/dist/swagger-ui.css';

.swagger-ui {
  width: 100%;
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

</style>

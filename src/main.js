// import '../node_modules/@mdi/font/css/materialdesignicons.css'
import '@mdi/font/css/materialdesignicons.css'
// See icons https://fonts.google.com/icons?selected=Material+Icons
import Vue from 'vue';
import Vuex from 'vuex';
import Axios from 'axios';
import Root from './components/Root.vue';
import 'swagger-ui/dist/swagger-ui.css';
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import router from './router';
import VueCookie from 'vue-cookie';

import gitlab from './storage/gitlab';
import DocHubDoc from "./components/Docs/DocHubDoc";
import Context from "./components/Architecture/Context";
import Anchor from "./components/Tools/Anchor";
import Image from "./components/Tools/Image";
import Aspect from "./components/Architecture/Aspect";
import Component from "./components/Architecture/Component";
import Technology from "./components/Techradar/Technology";
import Radar from "./components/Techradar/Main";
import PlantUML from "./components/Schema/PlantUML";

import '@/assets/styles/main.css';

window.Vue = Vue;
window.Router = router;

Vue.use(Vuex);
Vue.use(Vuetify);
Vue.use(VueCookie);

Vue.prototype.$axios = Axios;
Vuex.Store.prototype.$axios = Axios;

let store = new Vuex.Store(gitlab);
window.Vuex = store;
store.dispatch('init');

Vue.component('dochub-doc', DocHubDoc);
Vue.component('dochub-context', Context);
Vue.component('dochub-component', Component);
Vue.component('dochub-aspect', Aspect);
Vue.component('dochub-anchor', Anchor);
Vue.component('dochub-image', Image);
Vue.component('dochub-technology', Technology);
Vue.component('dochub-radar', Radar);
Vue.component('dochub-plantuml', PlantUML);

new Vue(Object.assign({
    el: '#app',
    router,
    vuetify: new Vuetify({
        icons: {
            iconfont: 'mdi', // default - only for display purposes
        },
    }),
    store
}, Root));

import '@mdi/font/css/materialdesignicons.css'
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
import Aspect from "./components/Architecture/Aspect";

window.Vue = Vue;

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
Vue.component('dochub-aspect', Aspect);
Vue.component('dochub-anchor', Anchor);

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

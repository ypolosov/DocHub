// import '@mdi/font/css/materialdesignicons.css';

import Vue from 'vue';
import App from './app/components/app.vue';
import env from '@/helpers/env';

import Aspect from '@/components/Architecture/Aspect.vue';
import Component from '@/components/Architecture/Component.vue';
import Context from '@/components/Architecture/Context.vue';
import DocHubDoc from '@/components/Docs/DocHubDoc.vue';
import PlantUML from '@/components/Schema/PlantUML.vue';
import Radar from '@/components/Techradar/Main.vue';
import Technology from '@/components/Techradar/Technology.vue';
import Anchor from '@/components/Tools/Anchor.vue';
import Image from '@/components/Tools/Image.vue';
import Entity from '@/components/Entities/Entity.vue';
import VueSplit from 'vue-split-panel';

import GlobalMixin from '@/mixins/global';

import { vuetify } from '@/vscode/app/plugins/vuetify';
import { createRouter } from '@/vscode/create-router';
import { createProviders } from './create-providers';
import { createVsCodeListener, createVsCodeDefaultSettings } from './create-vs-code-listener';
import { createStore } from './store/store';

import '@/assets/styles/main.css';
import 'swagger-ui/dist/swagger-ui.css';

Vue.use(VueSplit);
Vue.component('DochubDoc', DocHubDoc);
Vue.component('DochubContext', Context);
Vue.component('DochubComponent', Component);
Vue.component('DochubAspect', Aspect);
Vue.component('DochubAnchor', Anchor);
Vue.component('DochubImage', Image);
Vue.component('DochubTechnology', Technology);
Vue.component('DochubRadar', Radar);
Vue.component('DochubPlantuml', PlantUML);
Vue.component('DochubEntity', Entity);

function main(settings, uri) {
	Vue.config.ignoredElements = ['asyncapi-component'];

	if (env.isVsPlugin()) {
		createVsCodeDefaultSettings(settings, uri);
	}

	const providers = createProviders();
	const router = createRouter();
	const store = createStore();

	if (env.isVsPlugin()) {
		createVsCodeListener(store, router);
	}

	store.dispatch('init');

	Vue.mixin(GlobalMixin);

	const app = new Vue({
		provide: {
			...providers
		},
		render(createElement) {
			return createElement(App);
		},
		router,
		vuetify,
		store
	});

	window.Vue = Vue;
	window.Router = router;

	app.$mount('#app');
}

export { main };

if (!env.isVsPlugin()) {
	main();
}


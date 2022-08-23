import '@mdi/font/css/materialdesignicons.css';

import Vue from 'vue';
import App from './app/components/app.vue';

import Aspect from '@/components/Architecture/Aspect.vue';
import Component from '@/components/Architecture/Component.vue';
import Context from '@/components/Architecture/Context.vue';
import DocHubDoc from '@/components/Docs/DocHubDoc.vue';
import PlantUML from '@/components/Schema/PlantUML.vue';
import Radar from '@/components/Techradar/Main.vue';
import Technology from '@/components/Techradar/Technology.vue';
import Anchor from '@/components/Tools/Anchor.vue';
import Image from '@/components/Tools/Image.vue';

import GlobalMixin from '@/mixins/global';

import { vuetify } from '@/vscode/app/plugins/vuetify';
// import { createRouter } from '@/vscode/create-router';
import { createProviders } from './create-providers';
// import { createVsCodeListener } from './create-vs-code-listener';
import { createStore } from './store/store';

import '@/assets/styles/main.css';
import 'swagger-ui/dist/swagger-ui.css';

import router from '@/router';

Vue.component('DochubDoc', DocHubDoc);
Vue.component('DochubContext', Context);
Vue.component('DochubComponent', Component);
Vue.component('DochubAspect', Aspect);
Vue.component('DochubAnchor', Anchor);
Vue.component('DochubImage', Image);
Vue.component('DochubTechnology', Technology);
Vue.component('DochubRadar', Radar);
Vue.component('DochubPlantuml', PlantUML);

function main(uri = '') {
	const providers = createProviders();
	const store = createStore();
	// const router = createRouter();
	
	Vue.mixin(GlobalMixin);
	// store.dispatch('init');

	store.dispatch('init', uri);

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

	app.$mount('#app');
}

export default {
	main
};

main();

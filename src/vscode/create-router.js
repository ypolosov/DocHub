import Vue from 'vue';
import VueRouter from 'vue-router';

import appRoutes from './app/routes';

Vue.use(VueRouter);

export function createRouter() {
	const routerOptions = {
		base: process.env.BASE_URL,
		mode: 'history',
		routes: [
			...appRoutes
		]
	};

	return new VueRouter(routerOptions);
}

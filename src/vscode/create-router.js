import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

export function createRouter() {
	const routerOptions = {
		base: process.env.BASE_URL,
		mode: 'history',
		routes: [],
		scrollBehavior(to, from, savedPosition) {
			if (to.hash === '#no-scroll') {
				return undefined;
			}

			if (to.hash) {
				return { selector: to.hash };
			}

			if (savedPosition) {
				return savedPosition;
			}

			return { x: 0, y: 0 };
		}
	};

	return new VueRouter(routerOptions);
}

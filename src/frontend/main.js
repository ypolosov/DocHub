import {Vue, router, store, vuetify, Root} from './index';

document.addEventListener('DOMContentLoaded', () => {
	new Vue({
		router,
		render(createElement) {
			return createElement(Root);
		},
		vuetify,
		store
	}).$mount('#app');
});

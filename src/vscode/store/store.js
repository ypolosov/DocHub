import Vue from 'vue';
import Vuex, { Store } from 'vuex';

import gitlab from '@/storage/gitlab';

Vue.use(Vuex);

export function createStore() {

	return new Store({
		strict: process.env.NODE_ENV !== 'production',
		...gitlab
	});
}

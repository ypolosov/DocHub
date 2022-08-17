import Vue from 'vue';
import Vuex, { Store } from 'vuex';

import { state } from './state';
import { mutations } from './mutations';
import { createActions } from './actions';

export function createStore() {
	Vue.use(Vuex);

	const actions = createActions();

	return new Store({
		strict: process.env.NODE_ENV !== 'production',
		actions,
		mutations,
		state
	});
}

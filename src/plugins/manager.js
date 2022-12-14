import Vue from 'vue';

const objects = {
	documents: {}
};

const registrar = {
	documents: {
		register(id, component) {
			// eslint-disable-next-line no-debugger
			debugger;
			objects.documents[id] = component;
			Vue.component(`plugin-doc-${id}`, component);
		}
	}
};

export default {
	registrar,
	objects
};

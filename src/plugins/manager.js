const objects = {
	documents: {}
};

const registrar = {
	documents: {
		register(id, component) {
			objects.documents[id] = component;
		}
	}
};

export default {
	registrar
};

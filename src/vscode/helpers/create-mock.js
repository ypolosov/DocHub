

export function createMock(store) {
	return {
		initProject(uri) {
			store.dispatch('init', uri);
		},
		initRoot() {
			// const result = Parser.import(requests.makeURIByBaseURI(config.root_manifest, requests.getSourceRoot()));

			// store.commit('SET_MANIFEST', Object.freeze(Parser.manifest));
			// store.commit('SET_SOURCES', Object.freeze(Parser.mergeMap));
		}
	};
}

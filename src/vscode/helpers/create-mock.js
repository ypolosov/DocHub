import YAML from 'yaml';

function normalizeResponse({ type, content }) {
	if (type === 'yaml') {
		return YAML.parse(content);
	} else if (type === 'json') {
		return JSON.parse(content);
	}

	return content;
}

export function createMock(store) {
	return {
		initProject(uri) {
			store.dispatch('init', uri);
		},
		initRoot() {
			// const result = Parser.import(requests.makeURIByBaseURI(config.root_manifest, requests.getSourceRoot()));

			// store.commit('SET_MANIFEST', Object.freeze(Parser.manifest));
			// store.commit('SET_SOURCES', Object.freeze(Parser.mergeMap));
		},
		request(uri) {
			return new Promise((res, rej) => {
				vscode.postMessage({
					command: 'request',
					content: JSON.stringify(uri)
				});

				window.addEventListener('message', (event) => {
					const { command, content, error } = event.data;

					if (command === 'response') {
						if (error) {
							rej(error);
						} else {
							res({ data: normalizeResponse(content) });
						}
					}
				});
			});
		}
	};
}

import config from '@/../config';
import YAML from 'yaml';

function normalizeResponse(type, content) {
	if (type === 'yaml') {
		return YAML.parse(content);
	} else if (type === 'json') {
		return JSON.parse(content);
	}

	return content;
}

const listeners = {};

window.addEventListener('message', (event) => {
	const { command, content, error } = event?.data;

	if (command === 'response') {
		const { stringifedUri, value, type } = content;

		if (error) {
			listeners[stringifedUri].rej(error);
		} else {
			listeners[stringifedUri].res({ data: normalizeResponse(type, value) });
		}
	}
});

export function createMock(store) {
	return {
		initProject(uri) {
			store.dispatch('init', uri);
		},
		renderPlantUML: function(uml) {
			return this.request({ source: uml });
		},
		request(uri) {
			const stringifedUri = JSON.stringify(uri);

			vscode.postMessage({
				command: 'request',
				content: stringifedUri
			});
			
			return new Promise((res, rej) => {
				listeners[stringifedUri] = { res, rej };
			});	
		}
	};
}

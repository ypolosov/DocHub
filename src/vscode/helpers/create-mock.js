import plantuml from '@/helpers/plantuml';
import YAML from 'yaml';

function normalizeResponse(type, content) {
	if (type === 'yaml') {
		return YAML.parse(content);
	} 

	if (type === 'json') {
		return JSON.parse(content);
	} 

	if (type === 'plantuml') {
		return content;
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
		settings: {
			render: {
				external: false,
				server: 'https://www.plantuml.com/plantuml/svg/'
			}
		},
		initProject(uri) {
			store.dispatch('init', uri);
		},
		renderPlantUML: (uml) => {
			const stringifedUri = JSON.stringify(plantuml.svgURL(uml));

			vscode.postMessage({
				command: 'plantuml',
				content: stringifedUri
			});

			return new Promise((res, rej) => {
				listeners[stringifedUri] = { res, rej };
			});	
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

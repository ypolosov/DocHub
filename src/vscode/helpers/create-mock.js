import plantuml from '@/helpers/plantuml';
import { getContentType, normalizeResponse } from '@/vscode/helpers/common';

const listeners = {};

export function createMock(store) {
	window.addEventListener('message', (event) => {
		const { command, content, error } = event?.data;

		if (command === 'response') {
			const { stringifedUri, value, type } = content;

			if (error) {
				throw error;
			}

			try {
				const data = normalizeResponse(type, value);

				listeners[stringifedUri].res({ 
					data,
					headers: {
						'content-type': getContentType(type)
					}
				});
			} catch(e) {
				listeners[stringifedUri].rej(e);
			}
		}

		if (command === 'update-files') {
			const { uri } = content;
			
			store.dispatch('init', uri);
		}

		if(command === 'is-root-manifest') {
			const { uri } = content;

			if (uri) {
				store.commit('setHasRootFileVsCode', true);
				store.dispatch('init', uri);
			} else {
				store.commit('setHasRootFileVsCode', false);
				store.commit('clean');
			}
		}
	});

	return {
		...window.$PAPI,
		download: (content, title, description) => {
			const stringifedUri = JSON.stringify({
				content, title, description
			});

			vscode.postMessage({
				command: 'download',
				content: stringifedUri
			});
		},
		goto: (href) => {
			vscode.postMessage({
				command: 'goto',
				content: JSON.stringify(href)
			});
		},
		reload: () => {
			vscode.postMessage({
				command: 'reload-force',
				content: ''
			});
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

import plantuml from '@/helpers/plantuml';
import config from '../../../config';

import { getContentType, normalizeResponse } from '@/vscode/helpers/common';
import { v4 as uuidv4 } from 'uuid';

const listeners = {};

export function createMock(store) {
	window.addEventListener('message', (event) => {
		const { command, content, error } = event?.data;

		if (command === 'response') {
			const { value, type, uuid } = content;

			if (error) {
				listeners[uuid].rej(error);
			}

			try {
				const data = normalizeResponse(type, value);

				listeners[uuid].res({ 
					data,
					headers: {
						'content-type': getContentType(type)
					}
				});
			} catch(e) {
				listeners[uuid].rej(e);
			} finally {
				delete listeners[uuid];
			}
		}

		if (command === 'has-root-manifest') {
			const { uri } = content;
			
			if (uri === null) {
				config.root_manifest = null;
				store.commit('setNoInited', true);
			} else {
				config.root_manifest = uri;
				store.dispatch('reloadAll');
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
			const uuid = uuidv4();

			vscode.postMessage({
				command: 'plantuml',
				content: {
					stringifedUri,
					uuid
				}
			});

			return new Promise((res, rej) => {
				listeners[uuid] = { res, rej };
			});	
		},
		request(uri) {
			const stringifedUri = JSON.stringify(uri);
			const uuid = uuidv4();

			vscode.postMessage({
				command: 'request',
				content: {
					stringifedUri,
					uuid
				}
			});
			
			return new Promise((res, rej) => {
				listeners[uuid] = { res, rej };
			});	
		}
	};
}

import axios from 'axios';

export class VscodeExtensionService {
	baseUrl = '/';

	constructor({ client = axios } = {}) {
		this.client = client;
	}

	createOne(content = '') {
		vscode.postMessage({ 
			command: 'create',
			content
		});
	}
}

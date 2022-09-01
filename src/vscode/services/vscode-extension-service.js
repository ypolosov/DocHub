import axios from 'axios';

export class VscodeExtensionService {
	baseUrl = '/';

	constructor({ client = axios } = {}) {
		this.client = client;
	}

	checkIsRootManifest() {
		vscode.postMessage({
			command: 'check-is-root-manifest',
			content: ''
		});
	}

	createOne(content = '') {
		vscode.postMessage({ 
			command: 'create',
			content
		});
	}
}

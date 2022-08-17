import axios from 'axios';

export class VscodeExtensionService {
	baseUrl = '/';

	constructor({ client = axios } = {}) {
		this.client = client;
	}

	createEmptyProject() {
		vscode.postMessage('mock');
	}

	createDefaultProject() {
		vscode.postMessage('hello');
	}
}

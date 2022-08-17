import { VscodeExtensionService } from './services/vscode-extension-service';

export function createProviders() {
	return {
		vscodeExtensionService: new VscodeExtensionService()
	};
}

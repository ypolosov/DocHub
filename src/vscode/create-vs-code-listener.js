import { createSettings } from './helpers/create-settings';
import { createMock } from './helpers/create-mock';

import config from '../../config';

export function createVsCodeListener(store) {
	window.$PAPI = createMock(store);
}

export function createVsCodeDefaultSettings(settings, uri) {
	window.$IDE_PLUGIN = true;
	window.$PAPI = createSettings(settings);

	config.root_manifest = uri;
	config.pumlServer = window.$PAPI?.settings?.render?.server
	|| process.env.VUE_APP_PLANTUML_SERVER 
	|| 'www.plantuml.com/plantuml/svg/';
}

import { createSettings } from './helpers/create-settings';
import { createMock } from './helpers/create-mock';

import config from '../../config';
import gateway from '@/idea/gateway';

export function createVsCodeListener(store, router) {
	window.$PAPI = createMock(store);

	gateway.appendListener('navigate/component', (data) => {
		router.push({ path: `/architect/components/${Object.keys(data)[0]}`});
	});
	
	gateway.appendListener('navigate/document', (data) => {
		router.push({ path: `/docs/${Object.keys(data)[0]}`});
	});
	
	gateway.appendListener('navigate/aspect', (data) => {
		router.push({ path: `/architect/aspects/${Object.keys(data)[0]}`});
	});
	
	gateway.appendListener('navigate/context', (data) => {
		router.push({ path: `/architect/contexts/${Object.keys(data)[0]}`});
	});
}

export function createVsCodeDefaultSettings(settings, uri) {
	window.$IDE_PLUGIN = true;
	window.$PAPI = createSettings(settings);

	config.root_manifest = uri;
	config.pumlServer = window.$PAPI?.settings?.render?.server
	|| process.env.VUE_APP_PLANTUML_SERVER 
	|| 'www.plantuml.com/plantuml/svg/';
}

import { createSettings } from './helpers/create-settings';
import { createMock } from './helpers/create-mock';

export function createVsCodeListener(store) {
	window.$PAPI = createMock(store);
}

export function createVsCodeDefaultSettings(settings) {
	window.$PAPI = createSettings(settings);
}

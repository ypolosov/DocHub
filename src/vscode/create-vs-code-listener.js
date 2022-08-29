import { createMock } from './helpers/create-mock';

export function createVsCodeListener(store) {
	window.$PAPI = createMock(store);
}

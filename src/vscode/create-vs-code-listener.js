import { createMock } from './helpers/create-mock';

export function createVsCodeListener(store) {
	window.VS_CODE_LISTENER = createMock(store);
}

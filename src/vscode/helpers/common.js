import YAML from 'yaml';

export function normalizeResponse(type, content) {
	if (['jpg', 'jpeg', 'png', 'svg'].includes(type)) {
		return Buffer.from(content, 'base64');
	}

	if (type === 'yaml') {
		return YAML.parse(content);
	}

	if (type === 'json') {
		return JSON.parse(content);
	}

	if (type === 'plantuml') {
		return content;
	}

	return content;
}

export function getContentType(type) {
	if (type === 'svg') {
		return 'image/svg+xml';
	}

	if (['jpg', 'jpeg', 'png'].includes(type)) {
		return `image/${type}`;
	}

	return '';
}

export function throttle(func, wait) {
	let isThrottled = false;
	let savedArgs = null;
	let savedThis = null;
	let resolvePrev = null;

	const startThrottle = () => {
		isThrottled = true;

		setTimeout(function() {
			isThrottled = false;
			if (savedArgs && resolvePrev) {
				resolvePrev(func.apply(savedThis, savedArgs));

				resolvePrev = null;
				savedArgs = null;
				savedThis = null;

				startThrottle();
			}
		}, wait);
	};

	return function wrapper(...args) {
		return new Promise(resolve => {
			if (isThrottled) {
				if (resolvePrev) resolvePrev(undefined);

				resolvePrev = resolve;
				savedArgs = args;
				savedThis = this;
				return;
			}

			resolve(func.apply(this, args));

			startThrottle();
		});
	};
}

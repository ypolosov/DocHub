import axios from 'axios';
import YAML from 'yaml';
import crc16 from './crc16';
import env, { Plugins } from './env';
import { responseCacheInterceptor, requestCacheInterceptor } from './cache';
// import uriTool from '@/helpers/uri';
import gitlab from '@/helpers/gitlab';


// CRC16 URL задействованных файлов
const tracers = {};

// Add a request interceptor

const responseErrorInterceptor = (error) => {
	if (error.response.status === 304) {
		if (error.config.lastCachedResult) {
			return {
				...error.response,
				data: error.config.lastCachedResult.data
			};
		}
	}

	return Promise.reject(error);
};

// Интерцептор для GitLab авторизации
axios.interceptors.request.use(async(params) => {
	if (env.cache) {
		await requestCacheInterceptor(params);
	}
	return gitlab.axiosInterceptor(params);
}, (error) => Promise.reject(error));

// Здесь разбираемся, что к нам вернулось из запроса и преобразуем к формату внутренних данных
axios.interceptors.response.use(async(response) => {
	if (response.config.responseHook)
		response.config.responseHook(response);
	if (typeof response.data === 'string') {
		if (!response.config.raw) {
			const url = (response.config.url || '').toString().split('?')[0].toLowerCase();
			if (
				(url.indexOf('.json/raw') >= 0)
				|| (url.slice(-5) === '.json')
				|| (response?.headers || {})['content-type'] === 'application/json'
				)
				response.data = JSON.parse(response.data);
			else if (
				(url.indexOf('.yaml/raw') >= 0) 
				|| (url.slice(-5) === '.yaml') 
				|| (response?.headers || {})['content-type'] === 'application/x-yaml')
				response.data = YAML.parse(response.data);
		}
	}

	if (env.cache) {
		const reRequest = await responseCacheInterceptor(response);

		if (reRequest) {
			return axios(reRequest);
		}
	}

	return response;
}, responseErrorInterceptor);

if (window.$PAPI) {
	window.$PAPI.middleware = function(response) {
		let type = response.contentType;
		switch (type) {
			case 'yaml': response.data = YAML.parse(response.data); break;
			case 'json': response.data = JSON.parse(response.data); break;
			case 'jpg':
				type = 'jpeg';
			// eslint-disable-next-line no-fallthrough
			case 'jpeg':
			case 'png':
			case 'svg':
				if (type === 'svg') type = 'svg+xml';
				response.data = Buffer.from(response.data, 'base64');
				response.headers = Object.assign(response.headers || {}, {
					'content-type': `image/${type}`
				});
				break;
		}
		return response;
	};
}

export default {
	axios,
	getSourceRoot() {
		if (env.isPlugin(Plugins.idea)) {
			return 'plugin:/idea/source/';
		} else {
			return window.origin + '/';
		}
	},

	// Фиксируются все обращения для построения карты задействованных русурсов
	trace(url) {
		tracers[crc16(url)] = Date.now();
	},

	// Возвращает время последнего обращения к ресурсу
	isUsedURL(url) {
		return tracers[crc16(url)];
	},

	// Транслирует ссылки на backend в прямые URL
	translateBackendURL(url) {
		const finalURl = url && url.toString();
		if (finalURl && finalURl.startsWith('backend://')) {
			return (new URL(finalURl.slice(10), env.backendFileStorageURL()));
		} else {
			return url;	
		}
	},

	// axios_params - параметры передаваемые в axios
	// 		responseHook - содержит функцию обработки ответа перед работой interceptors
	//		raw - если true возвращает ответ без обработки
	request(uri, baseURI, axios_params) {
		let params = Object.assign({}, axios_params);
		params.url = uri;
		// Если ссылка ведет на backend конвертируем ее
		const strURI = (uri || '').toString();
		if (strURI.startsWith('backend://')) {
			const structURI = strURI.split('/');
			const origin = `${structURI[0]}//${structURI[2]}/`;
			const path = strURI.slice(origin.length);
			params.url = new URL(encodeURIComponent(path), this.translateBackendURL(origin));
		} else if ((baseURI || '').toString().startsWith('backend://')) {
			params.url = new URL(encodeURIComponent(uri), this.translateBackendURL(baseURI));
		}
		if (
			env.isPlugin(Plugins.idea) && params.url.split(':')[0] === 'plugin' ||
			env.isPlugin(Plugins.vscode)
		) {
			this.trace(params.url);
			return window.$PAPI.request(params);
		} else {
			return axios(params);
		}
	}
};

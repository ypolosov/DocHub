import axios  from  'axios';
import config from '../../config';
import YAML from 'yaml';
import crc16 from './crc16';
import env, {Plugins} from './env';
import { responseCacheInterceptor, requestCacheInterceptor } from './cache';
import uriTool from '@/global/manifest/tools/uri.mjs';

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

axios.interceptors.request.use(async(params) => {

  if (env.cache) {
    await requestCacheInterceptor(params);
  }

  if (config.gitlab_server && ((new URL(params.url)).host === (new URL(config.gitlab_server)).host)) {
    if (!params.headers) params.headers = {};
    // eslint-disable-next-line no-undef
    params.headers['Authorization'] = `Bearer ${config.porsonalToken || Vuex.state.access_token}`;
  }

  return params;
}, (error) =>  Promise.reject(error));

axios.interceptors.response.use(async(response) => {
  if (response.config.responseHook)
    response.config.responseHook(response);
  if (typeof response.data === 'string') {
    if (!response.config.raw) {
      const url = response.config.url.split('?')[0].toLowerCase();
      if ((url.indexOf('.json/raw') >= 0) || (url.slice(-5) === '.json'))
        response.data = JSON.parse(response.data);
      else if ((url.indexOf('.yaml/raw') >= 0) || (url.slice(-5) === '.yaml'))
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

if(window.$PAPI) {
	window.$PAPI.middleware = function(response) {
		let type = response.contentType;
		switch(type) {
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
	getSourceRoot(){
		if(env.isPlugin(Plugins.idea)) {
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

	// axios_params - параметры передавамые в axios
	// 		responseHook - содержит функцию обработыки ответа перед работой interceptors
	//		raw - если true возвращает ответ без обработки
	request(uri, baseURI, axios_params) {
		let params = Object.assign({}, axios_params);

		params.source = uriTool.makeURL(uri, baseURI);
		params.url = params.source.url.toString();
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

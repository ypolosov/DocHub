// eslint-disable-next-line no-useless-escape
let cefQuery = (Object.getOwnPropertyNames(window).filter(item => /^cefQuery\_[0-9]/.test(item)) || [])[0];

// Если API не обнаружились - грустим
if (!cefQuery) {
	document.innerHTML = 'Здесь плагина нет :(';
} else cefQuery = window[cefQuery];

setTimeout(() => document.innerHTML = 'Здесь плагина нет :(', 100);

export default {
	isDebug: false,
	// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-empty-function
	middleware(response) {},
	settings: {},
	cefQuery: null,
	request(params) {
		const data = JSON.stringify(params);
		// eslint-disable-next-line no-console
		this.isDebug && console.info('plugin request.request', data);
		return new Promise(function(res, rej) {
			const resolve = function(result) {
				// eslint-disable-next-line no-console
				this.isDebug && console.info('plugin request.response:', JSON.stringify(result));
				try {
					const parseData = result || 'null';
					if (window.$PAPI?.middleware)
						res(window.$PAPI.middleware(JSON.parse(parseData)));
					else
						res(JSON.parse(parseData));
				} catch (e) {
					rej(e);
				}
			};
			const reject = function(errCode, errInfo) {
				// eslint-disable-next-line no-console
				console.error('plugin request.error:', errCode, errInfo);
				rej({
					response: {
						data: errInfo,
						headers: {},
						status: errCode
					}
				});
			};

			cefQuery({
				request: '' + data,
				onSuccess: resolve,
				onFailure: reject
			});
		});
	},
	renderPlantUML(uml) {
		return this.request({ url: 'plugin:/idea/plantuml/svg', source: uml });
	},
	messagePull() {
		return this.request({ url: 'plugin:/idea/gateway/pull' });
	},
	initProject(mode) {
		return this.request({ url: 'plugin:/idea/initproject', mode });
	},
	reload() {
		this.request({ url: 'plugin:/idea/reload' });
	},
	showDebugger() {
		this.request({ url: 'plugin:/idea/debugger/show' });
	},
	goto(source, entity, id) {
		this.request({ url: 'plugin:/idea/goto', source, entity, id });
	},
	download(content, title, description, extension) {
		this.request({ url: 'plugin:/idea/gateway/download', content, title, description, extension });
	},
	applyEntitiesSchema(schema) {
		this.request({ url: 'plugin:/idea/entities/applyschema', schema });
	},
	copyToClipboard(data) {
		this.request({ url: 'plugin:/idea/clipboard/copy', data });
	}
};

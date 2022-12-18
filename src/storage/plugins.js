/* Модуль работы с плагинами */
/*
import Vue from 'vue';
import env from '@/helpers/env';
import requests from '@/helpers/requests';
*/

export default {
	namespaced: true,
	state: {
		ready: false, // Признак готовности плагинов к использованию
		documents: {}
	},
	mutations: {
		setReady(state, value) {
			state.ready = value;
		},
		registerDocument(state, document) {
			state.documents[document.type] = document.component;
		}
	}
	/*
	,
	actions: {
		// Загружаем плагины
		init(context) {
			let counter = 0;

			if (!env.isProduction()) {
				// Получаем данные манифеста приложения
				requests.request('manifest.json', window.origin).then((response) => {
					(response?.data?.plugins || []).map((url) => {
						counter++;

						const decCounter = () => !(--counter) && context.commit('setReady', true);
						const id = url.split('/').pop().split('.').slice(0,1);

						const script = document.createElement('script');
						script.src = url;
						script.onload = function() {
							window[id].get('entry').then((plugin) => {
								// eslint-disable-next-line no-console
								console.info('YOUHOO!!!', plugin);
								// eslint-disable-next-line no-debugger
								debugger;
								try {
									const entry = plugin().default;
									entry({
										documents: {
											register(type, component) {
												Vue.component(`plugin-doc-${type}`, component);
												context.commit('registerDocument', { type, component });
											}
										}
									});
								} catch (e) {
								// eslint-disable-next-line no-console
									console.error(`Ощибка инициализации плагина [${url}]`, e);
								}
		
							}).catch((e) => {
								// eslint-disable-next-line no-console
								console.error(`Ошибка инициализации плагина [${url}]`, e);
							}).finally(decCounter);
						};
						script.onerror = (e) => {
							// eslint-disable-next-line no-console
							console.error(`Ошибка загрузки плагина [${url}]`, e);
							decCounter();
						};
						document.head.appendChild(script);

						if (!counter) context.commit('setReady', true);
					});
				}).catch((e) => {
					// eslint-disable-next-line no-console
					console.error('Не удалось загрузить манифест приложения', e);
					context.commit('setReady', true);
				});
			} else {
				const config = require('../../package.json');
				for(const id in config.plugins || {}) {
					counter++;
					const module = config.plugins[id];
					import(`../../plugins/${module}`).then((plugin) => {
						try {
							plugin.default({
								documents: {
									register(type, component) {
										Vue.component(`plugin-doc-${type}`, component);
										context.commit('registerDocument', { type, component });
									}
								}
							});
						} catch (e) {
						// eslint-disable-next-line no-console
							console.error(`Ощибка инициализации плагина [${module}]`, e);
						}
					}).catch((e) => {
					// eslint-disable-next-line no-console
						console.error(`Ощибка загрузки плагина [${module}]`, e);
					}).finally(() => {
						if(!--counter) context.commit('setReady', true);
					});
					if (!counter) context.commit('setReady', true);
				}
			}
		}
	}
	*/
};

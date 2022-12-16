/* Модуль работы с плагинами */
import Vue from 'vue';
import env from '@/helpers/env';

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
	},
	actions: {
		// Загружаем плагины
		init(context) {
			let counter = 0;

			if (env.isProduction()) {
				// eslint-disable-next-line no-console
				console.info('В проде плагинов еще нет :(');
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
};

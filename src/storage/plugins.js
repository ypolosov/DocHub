/* Модуль работы с плагинами */
import Vue from 'vue';
import env from '@/helpers/env';
import requests from '@/helpers/requests';

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
			// Регистрируем менеджер документов для плагинов
			window.DocHub.documents = {
				register(type, component) {
					Vue.component(`plugin-doc-${type}`, component);
					context.commit('registerDocument', { type, component });
				}
			};

			let counter = 0;

			if (env.isProduction()) { // Подключаем плагины для prod
				// Получаем данные манифеста приложения
				requests.request('manifest.json', window.origin).then((response) => {
					(response?.data?.plugins || []).map((url) => {
						counter++;

						const decCounter = () => !(--counter) && context.commit('setReady', true);

						const script = document.createElement('script');
						script.src = url;
						script.onload = function() {
							// eslint-disable-next-line no-console
							console.info(`Плагина [${url}] успешно подключен`);
							decCounter();
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
			} else { // Подключаем плагины для dev
				// Получаем данные о плагинах из package.json
				const config = require('../../package.json');
				for(const id in config.plugins || {}) {
					counter++;
					const module = config.plugins[id];
					import(`../../plugins/${module}`).then(() => {
						// eslint-disable-next-line no-console
						console.info(`Плагина [${module}] успешно подключен`);
					}).catch((e) => {
						// eslint-disable-next-line no-console
						console.error(`Ошибка загрузки плагина [${module}]`, e);
					}).finally(() => {
						if(!--counter) context.commit('setReady', true);
					});
					if (!counter) context.commit('setReady', true);
				}
			}
		}
	}
};

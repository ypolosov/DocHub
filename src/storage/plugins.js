/* Модуль работы с плагинами */
import Vue from 'vue';
import requests from '@/helpers/requests';
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
			// Регистрируем менеджер документов для плагинов
			window.DocHub.documents = {
				register(type, component) {
					component.mixins = component.mixins || [];
					Vue.component(`plugin-doc-${type}`, component);
					context.commit('registerDocument', { type, component });
				}
			};

			let counter = 0;

			// Получаем данные манифеста приложения
			!env.isPlugin() && requests.request('/manifest.json', new URL('/', window.location)).then((response) => {
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
		}
	}
};

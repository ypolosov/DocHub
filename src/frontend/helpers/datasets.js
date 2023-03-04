import requests from './requests';
import query from '../manifest/query';
import { MANIFEST_MODES } from '@front/manifest/enums/manifest-modes.enum';
import datasetDriver from '@global/datasets/driver.mjs';
import pathTool from '@global/manifest/tools/path.mjs';
import env from '@front/helpers/env';

export default function() {
	return Object.assign({}, datasetDriver,
		{
			// Дефолтный метод получения объекта данных
			dsResolver(datasetID) {
				const state = window.Vuex.state;
				return {
					// Обогащаем профиль информацией об идентификаторе
					subject: Object.assign({ _id: datasetID }, (state.manifest[MANIFEST_MODES.AS_IS].datasets || {})[datasetID]),
					baseURI: state.sources[`/datasets/${datasetID}`][0]
				};
			},
			async pathResolver(path) {
				if (env.isBackendMode())
					throw 'pathResolver backend mode is not released yet...';
				const state = window.Vuex.state;
				return {
					context: state.manifest[MANIFEST_MODES.AS_IS],
					subject: pathTool.get(state.manifest[MANIFEST_MODES.AS_IS], path),
					baseURI: state.sources[path][0]
				};
			},
			// Драйвер запросов к ресурсам
			request(url, baseURI) {
				return requests.request(url, baseURI);
			},
			// Драйвер запросов JSONata
			jsonataDriver: query,
			// Переопределяем метод получения данных для работы с бэком
			getDataOriginal: datasetDriver.getData,
			getData(context, subject, params, baseURI) {
				// Пока ничего не делаем
				return this.getDataOriginal(context, subject, params, baseURI);
			},
			getReleaseData: datasetDriver.releaseData,
			async releaseData(path, params) {
				if (env.isBackendMode()) throw 'releaseData Can not work in backend mode yet...';
				return this.getReleaseData(path, params);
			}
		});
}

import requests from './requests';
import query from '../manifest/query';
import { MANIFEST_MODES } from '@front/manifest/enums/manifest-modes.enum';
import datasetDriver from '@global/datasets/driver.mjs';

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
			// Драйвер запросов к ресурсам
			request: requests.request,
			// Драйвер запросов JSONata
			jsonataDriver: query
		});
}

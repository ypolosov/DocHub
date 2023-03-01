import request from './request.mjs';
import jsonataDriver from '../../global/jsonata/driver.mjs';
import datasetDriver from '../../global/datasets/driver.mjs';

export default function(app) {
	return Object.assign({}, datasetDriver,
		{
			// Дефолтный метод получения объекта данных
			dsResolver(datasetID) {
				return {
					// Обогащаем профиль информацией об идентификаторе
					subject: Object.assign({ _id: datasetID }, (app.storage.manifest.datasets || {})[datasetID]),
					baseURI: app.storage.mergeMap[`/datasets/${datasetID}`][0]
				};
			},
			// Драйвер запросов к ресурсам
			request,
			// Драйвер запросов JSONata
			jsonataDriver
		});
}

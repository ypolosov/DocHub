import request from './request.mjs';
import jsonataDriver from '../../global/jsonata/driver.mjs';
import datasetDriver from '../../global/datasets/driver.mjs';

export default function(app) {
	return Object.assign({}, datasetDriver,
		{
			// Дефолтный метод получения объекта данных
			dsResolver(datasetID) {
				const origin  = (app.storage.manifest.datasets || {})[datasetID];
				return origin ? {
					// Обогащаем профиль информацией об идентификаторе
					subject: Object.assign({ _id: datasetID }, origin),
					baseURI: (app.storage.mergeMap[`/datasets/${datasetID}`] || []) [0]
				} : null;
			},
			// Драйвер запросов к ресурсам
			request,
			// Драйвер запросов JSONata
			jsonataDriver
		});
}

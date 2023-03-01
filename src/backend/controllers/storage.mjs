import logger from '../utils/logger.mjs';
import request from '../helpers/request.mjs';
import queries from '../../global/jsonata/queries.mjs';
import jsonata from '../../global/jsonata/driver.mjs';

const LOG_TAG = 'controller-storage';

export default (app) => {
    // Выполняет предопределенные запросы
    app.get('/core/storage/query-preset/:uuid', async function(req, res) {
        let uuid = decodeURIComponent(req.params.uuid || '$unknown$');

        // Проверяем на наличие uuid в предопределенных запросах
        if (!queries.QUERIES[uuid]) {
            res.status(404).json({
                message: `Undefined query preset ${uuid}`
            });
            return;
        }

        // Если запрос уже лежит в кэше, берем оттуда. Если нет, то выполняем
        const result = app.cache[uuid] || (app.cache[uuid] = await jsonata.expression(queries.QUERIES[uuid]).evaluate(app.storage.manifest));
        res.status(200).json(result);
    });

    // Проксирует запрос к хранилищу
    app.get('/core/storage/:hash/:url', async function(req, res) {
        const hash = req.params.hash || '$unknown$';
        const url = decodeURIComponent(req.params.url);
        const uri = url.split('?')[0];
        const baseURL = app.storage?.md5Map[hash];
        logger.log(`Request to storage ${req.originalUrl}`, LOG_TAG);
        if (!baseURL || !uri) {
            res.status(403).json({
                message: 'Access denied'
            });
        } else {
            request(uri, baseURL, res)
                .catch((e) => res.status(500).json({
                    message: e.message,
                    error: e
                }));
        }
    });
};


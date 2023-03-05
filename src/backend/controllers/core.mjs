import logger from '../utils/logger.mjs';
import datasets from '../helpers/datasets.mjs';
import cache from '../storage/cache.mjs';
import queries from '../../global/jsonata/queries.mjs';

const LOG_TAG = 'controller-core';

export default (app) => {

    // Создает ответ на JSONata запрос и при необходимости кэширует ответ
    function makeJSONataQueryResponse(res, query, params, subject) {
        cache.pullFromCache(JSON.stringify({query, params, subject}), async()=> {
            return await datasets(app).parseSource(
                app.storage.manifest,
                query,
                subject,
                params
            );
        }, res);
    }

    // Проверяет доступность сервиса
    function isReady(res) {
        if (!app.storage) {
            res.status(503);
            res.json({});
            return false;
        }
        return true;
    }

    // Парсит переданные во внутреннем формате данные 
    function parseRequest(req) {
        const url = new URL(req.params.query, 'backend:/');
        const searchParams = Object.fromEntries(url.searchParams);
       
        return {
            query: decodeURIComponent(url.pathname.slice(1)),
            params: searchParams.params ? JSON.parse(decodeURIComponent(searchParams.params)) : undefined,
            subject: searchParams.subject ? JSON.parse(decodeURIComponent(searchParams.subject)) : undefined
        };
    }

    // Выполняет произвольные запросы 
    app.get('/core/storage/jsonata/:query', function(req, res) {
        if (!isReady(res)) return;

        const request = parseRequest(req);

        if ((request.query.length === 36) && queries.QUERIES[request.query]) {
            makeJSONataQueryResponse(res, `(${queries.makeQuery(queries.QUERIES[request.query], request.params)})`);
        } else {
            makeJSONataQueryResponse(res, request.query, request.params, request.subject);
        }
    });

    // Выполняет произвольные запросы 
    app.get('/core/storage/release-data-profile/:query', function(req, res) {
        if (!isReady(res)) return;

        const request = parseRequest(req);
        cache.pullFromCache(JSON.stringify({query: request.query, params: request.params}), async()=> {
            return await datasets(app).releaseData(request.query, request.params);
        }, res);
    });

    // Выполняет JSONata запрос
    app.get('/core/jsonata/query', function(req, res) {
        if (!app.storage) {
            res.status(503);
            res.json({});
            return;
        }
        const request = decodeURIComponent(req.query.request); 
        logger.log(`Received JSONata request (${request})`, LOG_TAG);
        cache.pullFromCache(request, async()=> {    
            return await datasets(app).getData(app.storage.manifest, { source: request });
        }, res);
    });
    app.get('/core/manifest/state', function(req, res) {
        if (!app.storage) {
            res.status(503);
            res.json({
                message: 'Server is not ready.'
            });
            return;
        }
        res.json({
            manifest: app.storage.manifest,
            mergeMap: app.storage.mergeMap
        });
    });
};


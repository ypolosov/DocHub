import datasets from '../helpers/datasets.mjs';
import cache from '../storage/cache.mjs';
import queries from '../../global/jsonata/queries.mjs';
import helpers from './helpers.mjs';

// const LOG_TAG = 'controller-core';

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
        if (!helpers.isServiceReady(app, res)) return;

        const request = parseRequest(req);

        if ((request.query.length === 36) && queries.QUERIES[request.query]) {
            makeJSONataQueryResponse(res, `(${queries.makeQuery(queries.QUERIES[request.query], request.params)})`);
        } else {
            makeJSONataQueryResponse(res, request.query, request.params, request.subject);
        }
    });

    // Выполняет произвольные запросы 
    app.get('/core/storage/release-data-profile/:query', function(req, res) {
        if (!helpers.isServiceReady(app, res)) return;

        const request = parseRequest(req);
        cache.pullFromCache(JSON.stringify({query: request.query, params: request.params}), async()=> {
            return await datasets(app).releaseData(request.query, request.params);
        }, res);
    });

    // Возвращает результат работы валидаторов
    app.get('/core/storage/validators/', function(req, res) {
        if (!helpers.isServiceReady(app, res)) return;
        res.json(app.storage.validators || []);
    });

    // Текущее полное состояние
    app.get('/core/manifest/state', function(req, res) {
        if (!helpers.isServiceReady(app, res)) return;

        res.json({
            manifest: app.storage.manifest,
            mergeMap: app.storage.mergeMap
        });
    });
};


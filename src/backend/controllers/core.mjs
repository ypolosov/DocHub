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

    // Выполняет произвольные запросы 
    app.get('/core/storage/jsonata/:query', function(req, res) {
        if (!app.storage) {
            res.status(503);
            res.json({});
            return;
        }

        const url = new URL(req.params.query, 'backend:/');
        const JSONataQuery = url.pathname.slice(1);
        const searchParams = Object.fromEntries(url.searchParams);
        
        const params = searchParams.params ? JSON.parse(decodeURIComponent(searchParams.params)) : undefined;
        const subject = searchParams.subject ? JSON.parse(decodeURIComponent(searchParams.subject)) : undefined;

        if ((JSONataQuery.length === 36) && queries.QUERIES[JSONataQuery]) {
            makeJSONataQueryResponse(res, `(${queries.makeQuery(queries.QUERIES[JSONataQuery], params)})`);
        } else {
            makeJSONataQueryResponse(res, decodeURIComponent(JSONataQuery), params, subject);
        }
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


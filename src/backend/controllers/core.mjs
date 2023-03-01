import logger from '../utils/logger.mjs';
import datasets from '../helpers/datasets.mjs';
import cache from '../storage/cache.mjs';

const LOG_TAG = 'controller-core';

export default (app) => {
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


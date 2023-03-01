import logger from '../utils/logger.mjs';
import jsonata from '../../global/jsonata/driver.mjs';

const LOG_TAG = 'controller-core';

export default (app) => {
    // Выполняет JSONata запрос
    app.get('/core/jsonata/query', function(req, res) {
        if (!app.storage) {
            res.status(503);
            res.json({});
            return;
        }
        const request = req.query.request; 
        logger.log(`Received JSONata request (${request})`, LOG_TAG);
        const expression = jsonata.expression(req.query.request);
        try {
            res.json(expression.evaluate(app.storage.manifest));
        } catch (e) {
            res.status(500);
            res.json({
                message: e.message,
                error: e
            });
        }
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


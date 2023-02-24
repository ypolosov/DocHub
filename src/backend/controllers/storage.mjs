import logger from '../utils/logger.mjs';
import request from '../helpers/request.mjs';

const LOG_TAG = 'controller-storage';

export default (app) => {
    // Выполняет JSONata запрос
    app.get('/core/storage/:hash/:url', async function(req, res) {
        const hash = req.params.hash || '$unknown$';
        const url = decodeURIComponent(req.params.url);
        const uri = url.split('?')[0];
        const baseURL = app.storage?.md5Map[hash];
        logger.log(`Request to storage ${req.originalUrl}`, LOG_TAG);
        if (!baseURL || !uri) {
            res.status(403).json({});
        } else {
            await request(uri, baseURL, res);
        }
    });
};


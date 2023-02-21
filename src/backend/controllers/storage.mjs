import logger from '../utils/logger.mjs';
import path from 'path';

const LOG_TAG = 'controller-storage';

// Проверяет разрешен ли путь к файлу
function isAvailablePath(path) {
    // eslint-disable-next-line no-undef
    return path.startsWith(`${$paths.public}/`);
}

export default (app) => {
    // Выполняет JSONata запрос
    app.get('/core/storage/*', function(req, res) {
        logger.log(`Request to storage ${req.originalUrl}`, LOG_TAG);
        // eslint-disable-next-line no-undef
        const finalPath = path.resolve($paths.public, req.originalUrl.slice(14).split('?')[0]);
        logger.log(`Final path is ${finalPath}`, LOG_TAG);
        if (!isAvailablePath(finalPath)) {
            res.status(403);
        } else {
            res.sendFile(finalPath);
        }
    });
};


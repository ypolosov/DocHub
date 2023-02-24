import prototype from '../../global/manifest/services/cache.mjs';
import request from '../helpers/request.mjs';
import logger from '../utils/logger.mjs';
import uriTool from '../helpers/uri.mjs';

const LOG_TAG = 'manifest-cache';

export default Object.assign(prototype, {
    // Выполняет resolve URL 
    makeURIByBaseURI: uriTool.makeURIByBaseURI,
    // Выполняет запрос к данным
    async request(url, propPath) {
        let result = null;
        // Если это рутовый манифест, формируем его по конфигурации
        if ((url === 'file:///$root$') && (propPath === '/')) {
            const imports = [];
            if ((process.env.VUE_APP_DOCHUB_APPEND_DOCHUB_DOCS || 'y').toLowerCase() === 'y') {
                imports.push('/documentation/root.yaml');
            }
            if (process.env.VUE_APP_DOCHUB_ROOT_MANIFEST) {
                imports.push(process.env.VUE_APP_DOCHUB_ROOT_MANIFEST);
            }
            logger.log(`Root manifest is [${imports.join('], [')}].`, LOG_TAG);
            result = {
                data : {
                    imports
                }
            };
        } else {
            logger.log(`Importing source [${url}]...`, LOG_TAG);
            result = await request(url);
            logger.log(`Source [${url}] is imported.`, LOG_TAG);
        }
        return result;
    }
});


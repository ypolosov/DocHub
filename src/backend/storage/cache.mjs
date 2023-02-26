import prototype from '../../global/manifest/services/cache.mjs';
import request from '../helpers/request.mjs';
import logger from '../utils/logger.mjs';
import uriTool from '../helpers/uri.mjs';
import { fileURLToPath } from 'url';
import yaml from 'yaml';
import path from 'path';
import fs from 'fs';

const LOG_TAG = 'manifest-cache';

function loadBaseMatamodel() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const source = path.resolve(__dirname, '../../assets/base.yaml');
    
    logger.log(`Import base metamodel from  [${source}].`, LOG_TAG);
    const content = fs.readFileSync(source, { encoding: 'utf8', flag: 'r' });
    return yaml.parse(content);
}

export default Object.assign(prototype, {
    // Выполняет resolve URL 
    makeURIByBaseURI: uriTool.makeURIByBaseURI,
    // Выполняет запрос к данным
    async request(url, propPath) {
        let result = null;
        // Если это рутовый манифест, формируем его по конфигурации
        if ((url === 'file:///$root$') && (propPath === '/')) {
            // Подключаем базовую метамодель
            const content = loadBaseMatamodel();
            if (!content.imports) content.imports = [];
            // Подключаем документацию, если нужно
            if ((process.env.VUE_APP_DOCHUB_APPEND_DOCHUB_DOCS || 'y').toLowerCase() === 'y') {
                content.imports.push('/documentation/root.yaml');
            }
            // Подключаем корневой манифест, если есть
            if (process.env.VUE_APP_DOCHUB_ROOT_MANIFEST) {
                content.imports.push(process.env.VUE_APP_DOCHUB_ROOT_MANIFEST);
            }
            logger.log(`Root manifest is [${content.imports.join('], [')}].`, LOG_TAG);
            result = {
                data : content
            };
        } else {
            logger.log(`Importing source [${url}]...`, LOG_TAG);
            result = await request(url);
            logger.log(`Source [${url}] is imported.`, LOG_TAG);
        }
        return result;
    }
});


import prototype from '../../global/manifest/services/cache.mjs';
import request from '../helpers/request.mjs';
import logger from '../utils/logger.mjs';
import uriTool from '../helpers/uri.mjs';
import { fileURLToPath } from 'url';
import yaml from 'yaml';
import path from 'path';
import fs from 'fs';
import md5 from 'md5';

const LOG_TAG = 'manifest-cache';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Подключает базовую метамодель
function loadBaseMatamodel() {
    const source = path.resolve(__dirname, '../../assets/base.yaml');

    logger.log(`Import base metamodel from  [${source}].`, LOG_TAG);
    const content = fs.readFileSync(source, { encoding: 'utf8', flag: 'r' });
    return yaml.parse(content);
}

// Кэш в памяти
const memoryCache = {};


export default Object.assign(prototype, {
    // Выполняет resolve URL 
    makeURIByBaseURI: uriTool.makeURIByBaseURI,
    // Получает данные из кэша 
    //  key - ключ
    //  resolve - если в кэше данные не будут найдены, будет вызвана функция для генерации данных
    //  res - response объект express. Если указано, то ответ сразу отправляется клиенту
    async pullFromCache(key, resolve, res) {
        try {
            let result = null;
            let fileName = null;
            const cacheMode = process.env.VUE_APP_DOCHUB_DATALAKE_CACHE || 'none';
            switch (cacheMode.toLocaleLowerCase()) {
                case 'none': result = resolve && await resolve() || undefined; break;
                case 'memory': result = memoryCache[md5(key)] || (resolve && (memoryCache[md5(key)] = await resolve())); break;
                default: {
                    const hash = md5(key);
                    fileName = path.resolve(__dirname, '../../../', cacheMode, `${hash}.cache`);
                    if (!fs.existsSync(fileName)) {
                        result = JSON.stringify(await resolve() || null);
                        fs.writeFileSync(fileName, result, { encoding: 'utf8' });
                    }
                }
            }

            if (res) {
                if (fileName) setTimeout(() => res.sendFile(fileName), 10);
                else res.status(200).json(result);
            } else if (fileName) {
                result = JSON.parse(fs.readFileSync(fileName, { encoding: 'utf8' }));
            }

            return res ? true : result;
        } catch (e) {
            logger.error(`Error of pull from cache with error: ${e.message}`, LOG_TAG);
            if (res) {
                res.status(500);
                res.json({
                    message: e.message,
                    error: e
                });
            }
            return undefined;
        }
    },
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
                data: content
            };
        } else {
            logger.log(`Importing source [${url}]...`, LOG_TAG);
            result = await request(url);
            logger.log(`Source [${url}] is imported.`, LOG_TAG);
        }
        return result;
    }
});


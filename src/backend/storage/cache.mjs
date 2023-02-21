import prototype from '../../global/manifest/services/cache.mjs';
import fs from 'fs';
import yaml from 'yaml';
import logger from '../utils/logger.mjs';
import axios from 'axios';
import uriTool from '../helpers/uri.mjs';
import gitlab from '../helpers/gitlab.mjs';
import path from 'path';

// Подключаем интерцептор авторизации GitLab
axios.interceptors.request.use(gitlab.axiosInterceptor);

// Здесь разбираемся, что к нам вернулось из запроса и преобразуем к формату внутренних данных
axios.interceptors.response.use(
    (response) => {
        if (typeof response.data === 'string') {
            if (!response.config.raw) {
                const url = response.config.url.split('?')[0].toLowerCase();
                if ((url.indexOf('.json/raw') >= 0) || url.endsWith('.json'))
                    response.data = JSON.parse(response.data);
                else if ((url.indexOf('.yaml/raw') >= 0) || url.endsWith('.yaml'))
                    response.data = yaml.parse(response.data);
            }
        }
        return response;
    }
);

const LOG_TAG = 'manifest-cache';

// Проверяет разрешен ли путь к файлу
function isAvailablePath(path) {
    // eslint-disable-next-line no-undef
    return path.startsWith(`${$paths.public}/`);
}

export default Object.assign(prototype, {
    // Выполняет resolve URL 
    makeURIByBaseURI: uriTool.makeURIByBaseURI,
    // Выполняет запрос к данным
    async request(url, propPath) {
        const uri = new URL(url);
        if (uri.protocol === 'file:') {
            // eslint-disable-next-line no-undef
            const fileName = path.join($paths.file_storage, uri.pathname);
            if (!isAvailablePath(fileName)) {
                throw `File [${fileName}] is not available.`;
            }
            logger.log(`Importing file [${fileName}]...`, LOG_TAG);
            const data = fs.readFileSync(fileName, { encoding: 'utf8', flag: 'r' });
            let result = {
                data: null
            };
            if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
                result.data = yaml.parse(data);
            } else if (fileName.endsWith('.json')) {
                result.data = JSON.parse(data);
            } else {
                throw `Can not parse file [${fileName}].`;
            }
            logger.log(`Import file [${fileName}] is done.`, LOG_TAG);
            return result;
        } else if ((uri.protocol === 'http:') || (uri.protocol === 'https:')) {
            const url = uri.toString();
            logger.log(`Importing source [${url}] over http...`, LOG_TAG);
            const result = await axios({ url });
            logger.log(`Import source [${url}] is done.`, LOG_TAG);
            return result;
        } else if (uri.protocol === 'gitlab:') {
            const url = uriTool.makeURL(uri).url.toString();
            logger.log(`Importing source [${url}] over gitlab...`, LOG_TAG);
            const result = await axios({ url });
            logger.log(`Import source [${url}] is done.`, LOG_TAG);
            return result;
        }
        // eslint-disable-next-line no-console
        throw `Can not processing protocol [${uri.protocol}] for url=[${url}] and property path=[${propPath}]`;
    }
});


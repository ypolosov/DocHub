import path from 'path';
import fs from 'fs';
import axios from 'axios';
import yaml from 'yaml';
import uriTool from './uri.mjs';
import gitlab from './gitlab.mjs';
import bitbucket from './bitbucket.mjs';
import logger from '../utils/logger.mjs';

const REQUEST_TAG = 'request';


if (process.env.VUE_APP_DOCHUB_GITLAB_URL) {
    // Подключаем интерцептор авторизации GitLab
    axios.interceptors.request.use(gitlab.axiosInterceptor);
} else if (process.env.VUE_APP_DOCHUB_BITBUCKET_URL) {
    // Подключаем интерцептор авторизации BitBucket
    axios.interceptors.request.use(bitbucket.axiosInterceptor);
}

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

// Проверяет разрешен ли путь к файлу
function isAvailablePath(path) {
    // eslint-disable-next-line no-undef
    return path.startsWith(`${$paths.file_storage}/`);
}

// Определяет тип контента
function getContentType(url) {
    let contentType = null;
    const uri = url.split('?')[0];
    if (uri.endsWith('.yaml') || uri.endsWith('.yml') || (uri.indexOf('.yaml/raw') >= 0) || (uri.indexOf('.yml/raw') >= 0)) {
        contentType = 'application/x-yaml';
    } else if (uri.endsWith('.json') || (uri.indexOf('.json/raw') >= 0)) {
        contentType = 'application/json';
    }
    return contentType;
}

// Выполняет запрос по URL
//  url         - ссылка на ресурс
//  baseUIR     - базовый URI 
//  response    - Express response. Если установлен, то запрос будет работать как прокси.
async function request(url, baseURI, response) {
    // Разбираем URL
    let uri = null;
    if (baseURI) {
        uri = uriTool.makeURL(url, baseURI).url;
    } else {
        uri = new URL(url);
    }
    // Если локальное файловое хранилище
    if (uri.protocol === 'file:') {
        // eslint-disable-next-line no-undef
        const fileName = path.join($paths.file_storage, uri.pathname);
        if (!isAvailablePath(fileName)) {
            throw `File [${fileName}] is not available.`;
        }
        let contentType = getContentType(fileName);
        if (response) {
            contentType && response.setHeader('content-type', contentType);
            return response.sendFile(fileName);
        } else {
            const result = {
                data: fs.readFileSync(fileName, { encoding: 'utf8', flag: 'r' })
            };
            if (contentType === 'application/x-yaml') {
                result.data = yaml.parse(result.data);
            } else if (contentType === 'application/json') {
                result.data = JSON.parse(result.data);
            } 
            return result;
        }
    } // Если запрос по http / https
    else if ((uri.protocol === 'http:') || (uri.protocol === 'https:')) {
        const url = uri.toString();
        if (response) {
            let result = null;
            try {
                result = await axios({ url, responseType: 'stream' });
                const contentType = getContentType(url);
                contentType && response.setHeader('content-type', contentType);
                return result.data.pipe(response);
            } catch (e) {
                logger.error(`Error of request [${url}] with error [${e.message}]`, REQUEST_TAG);
                response.status(e?.response?.status || 500);
                response.json({
                    error: 'Error of request to original source.'
                });
            }
            return result;
        } else
            return await axios({ url });
    }
    // Если запрос к GitLab
    else if (uri.protocol === 'gitlab:') {
        return request(uriTool.makeURL(uri).url, baseURI, response);
    }
    // Если запрос к BitBucket
    else if (uri.protocol === 'bitbucket:') {
        return request(uriTool.makeURL(uri).url, baseURI, response);
    }
    // eslint-disable-next-line no-console
    throw `Can not processing protocol [${uri.protocol}] for url=[${url}]`;
}

export default request;

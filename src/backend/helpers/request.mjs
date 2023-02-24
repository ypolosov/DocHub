import path from 'path';
import fs from 'fs';
import axios from 'axios';
import yaml from 'yaml';
import uriTool from './uri.mjs';
import gitlab from './gitlab.mjs';

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

// Проверяет разрешен ли путь к файлу
function isAvailablePath(path) {
    // eslint-disable-next-line no-undef
    return path.startsWith(`${$paths.public}/`);
}

// Выполняет запрос по URL
//  url         - ссылка на ресурс
//  baseUIR     - базовый URI 
//  response    - Express response. Если установлен, то запрос будет работать как прокси.
export default async(url, baseURI, response) => {
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
        if (response) {
            return response.sendFile(fileName); 
        } else {
            const result = {
                data: fs.readFileSync(fileName, { encoding: 'utf8', flag: 'r' })
            };
            if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) {
                result.data = yaml.parse(result.data);
            } else if (fileName.endsWith('.json')) {
                result.data = JSON.parse(result.data);
            } else {
                throw `Can not parse file [${fileName}].`;
            }
            return result;
        }
    } // Если запрос по http / https
    else if ((uri.protocol === 'http:') || (uri.protocol === 'https:')) {
        const url = uri.toString();
        const result = await axios({ url, responseType: response ? 'stream' : 'json' });
        if (response) return result.data.pipe(response);
        return result;
    } // Если запрос к GitLab
    else if (uri.protocol === 'gitlab:') {
        const url = uriTool.makeURL(uri).url.toString();
        const result = await axios({ url, responseType: response ? 'stream' : 'json' });
        if (response) return result.data.pipe(response);
        return result;
    }
    // eslint-disable-next-line no-console
    throw `Can not processing protocol [${uri.protocol}] for url=[${url}]`;
};

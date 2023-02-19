import prototype from '../../global/manifest/services/cache.mjs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import yaml from 'yaml';
import logger from '../utils/logger.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __basedir = path.resolve(__dirname, '../../../public/');

const LOG_TAG = 'manifest-cache';

// Проверяет разрешен ли путь к файлу
function isAvailablePath(path) {
	return path.startsWith(`${__basedir}/`);
}

export default Object.assign(prototype, {
    async request(url, propPath) {
        const uri = new URL(url);
        if (uri.protocol === 'file:') {
            const fileName = path.join(__basedir, uri.pathname);
            if (!isAvailablePath(fileName)) {
                throw `File [${fileName}] is not available.`;
            }
            logger.log(`Importing file [${fileName}]...`, LOG_TAG);
            const data = fs.readFileSync(fileName, { encoding:'utf8', flag:'r' });
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
        }
        // eslint-disable-next-line no-console
        throw `Can not processing protocol [${uri.protocol}] for url=[${url}] and property path=[${propPath}]`;
    }
});


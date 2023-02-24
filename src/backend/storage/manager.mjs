import logger from '../utils/logger.mjs';
import manifestParser from '../../global/manifest/parser.mjs';
import cache from './cache.mjs';
import md5 from 'md5';

const LOG_TAG = 'storage-manager';

manifestParser.cache = cache;

manifestParser.onError = (error) => {
	logger.error(`Error of loading manifest ${error}`, LOG_TAG);
};

manifestParser.getBaseManifest = () => {
	logger.log('Returned base manifest', LOG_TAG);
	return {};
};

manifestParser.onStartReload = (parser) => {
	logger.log('Manifest start reloading', LOG_TAG);
};

manifestParser.onReloaded = (parser) => {
	logger.log(`Manifest is reloaded ${parser.manifest}`, LOG_TAG);
};

export default {
	reloadManifest: async function() {
		logger.log('Run full reload manifest', LOG_TAG);
		// Загрузку начинаем с виртуального манифеста
		await manifestParser.import('file:///$root$');
		logger.log('Full reload is done', LOG_TAG);
		const result = {
			manifest: manifestParser.manifest,
			mergeMap: {},
			md5Map: {}
		};
		for (const path in manifestParser.mergeMap) {
			result.mergeMap[path] = manifestParser.mergeMap[path].map((url) => {
				const hash = md5(url);
				result.md5Map[hash] = url;
				return `backend://${hash}/`;
			});
		}
		return result;
	}
};

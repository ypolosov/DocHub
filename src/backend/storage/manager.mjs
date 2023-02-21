import logger from '../utils/logger.mjs';
import manifestParser from '../../global/manifest/parser.mjs';
import cache from './cache.mjs';
import uriTool from '../helpers/uri.mjs';


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

// Преобразует внутренние ссылки (file:) в прямые
function resolveFileURI(mergeMap) {
	const result = {};
	for (const path in mergeMap) {
		result[path] = mergeMap[path].map((uri) => {
			if (uri.startsWith('file://')) {
				return uri;
			} else return uri;
		});
	}
	return result;
}

export default {
	reloadManifest: async function() {
		logger.log('Run full reload manifest', LOG_TAG);
		const baseURI = uriTool.makeURIByBaseURI(process.env.VUE_APP_DOCHUB_ROOT_MANIFEST || '/documentation/root.yaml', 'file:/');
		// const baseURI = uri.makeURIByBaseURI('https://dochub.info/documentation/docs/root.yaml', 'file:/');
		logger.log(`Root manifest is ${baseURI}.`, LOG_TAG);
		await manifestParser.import(baseURI);
		logger.log('Full reload is done', LOG_TAG);
		return {
			manifest: manifestParser.manifest,
			mergeMap: resolveFileURI(manifestParser.mergeMap)
		};
	}
};

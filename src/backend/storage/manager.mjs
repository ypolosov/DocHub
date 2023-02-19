import logger from '../utils/logger.mjs';
import manifestParser from '../../global/manifest/parser.mjs';
import cache from './cache.mjs';
import uri from '../../global/manifest/tools/uri.mjs';


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
		const baseURI = uri.makeURIByBaseURI(process.env.VUE_APP_DOCHUB_ROOT_MANIFEST || '/documentation/root.yaml', 'file:/');
		logger.log(`Root manifest is ${baseURI}.`, LOG_TAG);
		await manifestParser.import(baseURI);
		logger.log('Full reload is done', LOG_TAG);
	}
};

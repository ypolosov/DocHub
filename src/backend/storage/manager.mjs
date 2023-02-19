// import parser from '../../manifest/manifest_parser';
// const logger = require('../utils/logger.mjs');
import logger from '../utils/logger.mjs';

const LOG_TAG = 'storage-manager';

export default {
	reloadManifest: async function() {
		logger.log('Run full reload manifest', LOG_TAG);
		// parser.import('test');
		logger.log('Full reload is done', LOG_TAG);
	}
};

import manifestParser from '@global/manifest/parser.mjs';
import cache from '@front/manifest/cache';
import logger from '@back/utils/logger.mjs';
import requests from '@front/helpers/requests';
import env from '@front/helpers/env';

const LOG_TAG = 'storage-manager';

manifestParser.cache = cache;

manifestParser.makeBaseManifest = () => {
  logger.log('Returned base manifest', LOG_TAG);
  if (env.isAppendDocHubMetamodel) {
    const YAML = require('yaml');
    const baseYAML = require('!!raw-loader!@assets/base.yaml').default;
    return YAML.parse(baseYAML);
  } else return {};
};

manifestParser.reloadManifest = async function(payload){
  await manifestParser.startLoad();

  if (payload) {
    await (
      async function parserImport(next = 0) {
        if (payload?.length > next) {
          await manifestParser.import(payload[next], payload[next] !== env.rootManifest);
          await parserImport(next + 1);
        }
      }
    )();
  } else {
    if (!env.isPlugin()) {
      let doClearManifest = true;
      if (env.isAppendDocHubDocs) {
        await manifestParser.import(manifestParser.cache.makeURIByBaseURI('documentation/root.yaml', requests.getSourceRoot()));
        doClearManifest = false;
      }

      await manifestParser.import(manifestParser.cache.makeURIByBaseURI(env.rootManifest, requests.getSourceRoot()), !doClearManifest);
    } else {
      await manifestParser.import(
        manifestParser.cache.makeURIByBaseURI(env.rootManifest, requests.getSourceRoot()),
        true
      );
    }
  }

  manifestParser.stopLoad();
};

export default manifestParser;

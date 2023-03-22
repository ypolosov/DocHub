import manifestParser from '@global/manifest/parser.mjs';
import cache from '@front/manifest/cache';
import logger from '@back/utils/logger.mjs';
import config from '@front/config';
import requests from '@front/helpers/requests';
import env from '@front/helpers/env';

const LOG_TAG = 'storage-manager';

manifestParser.cache = cache;

manifestParser.makeBaseManifest = () => {
  logger.log('Returned base manifest', LOG_TAG);
  if ((process.env.VUE_APP_DOCHUB_APPEND_DOCHUB_METAMODEL || 'y').toLowerCase() === 'y') {
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
          await manifestParser.import(payload[next], payload[next] !== config.root_manifest);
          await parserImport(next + 1);
        }
      }
    )();
  } else {
    if (!env.isPlugin()) {
      let doClearManifest = true;
      if ((process.env.VUE_APP_DOCHUB_APPEND_DOCHUB_DOCS || 'y').toLowerCase() === 'y') {
        await manifestParser.import(manifestParser.cache.makeURIByBaseURI('documentation/root.yaml', requests.getSourceRoot()));
        doClearManifest = false;
      }
      
      await manifestParser.import(manifestParser.cache.makeURIByBaseURI(config.root_manifest, requests.getSourceRoot()), !doClearManifest);
    } else {
      await manifestParser.import(
        manifestParser.cache.makeURIByBaseURI(config.root_manifest, requests.getSourceRoot()),
        true
      );
    }
    /*
    let doClearManifest = true;
    if (
      (!env.isPlugin()) &&
      ((process.env.VUE_APP_DOCHUB_APPEND_DOCHUB_DOCS || 'y').toLowerCase() === 'y')
    ) {
      await manifestParser.import(
        manifestParser.cache.makeURIByBaseURI('documentation/root.yaml', requests.getSourceRoot()),
        false
      );
      doClearManifest = false;
    }

    //todo  Не ясно, почему !env.isPlugin(). Для того, чтобы вмердживать изменения? 
    await manifestParser.import(
      manifestParser.cache.makeURIByBaseURI(config.root_manifest, requests.getSourceRoot()),
      !env.isPlugin()
    );
    */
  }

  manifestParser.stopLoad();
};

export default manifestParser;

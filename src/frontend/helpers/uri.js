import config from '@front/config';
import uriTool from '@global/manifest/tools/uri.mjs';
import env from '@front/helpers/env';
import md5 from 'md5';

export default Object.assign({
    getBaseURIOfPath(path) {
        if (env.isBackendMode()) {
            return `backend://${md5(path)}/`;
        } else 
            return window.Vuex.state.sources[path][0];
    }
}, new uriTool(config));

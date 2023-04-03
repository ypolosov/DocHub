import prototype from '@global/manifest/services/cache.mjs';
import { fileURLToPath } from 'url';
import yaml from 'yaml';
import path from 'path';
import fs from 'fs';

function getFullPath(pRelativePath) {
  return fileURLToPath(new URL(pRelativePath, import.meta.url));
}

const mainFullPath = getFullPath('../../../');

function makeBaseManifest() {
  return yaml.parse(fs.readFileSync(
    path.resolve(`${mainFullPath}src`, 'assets/base.yaml'),
    { encoding: 'utf8', flag: 'r' }
  ));
}

function request(url, baseURI, response){
  let uri = null;
  if (baseURI) {
    uri = {
      type: 'web',
      url
    };
  } else {
    uri = new URL(url);
  }

  // eslint-disable-next-line no-undef
  const fileName = path.join($paths.file_storage, uri.pathname);
  const contentUri = url.split('?')[0];

  let contentType = null;

  if (
    contentUri.endsWith('.yaml') ||
    contentUri.endsWith('.yml') ||
    (contentUri.indexOf('.yaml/raw') >= 0) || (contentUri.indexOf('.yml/raw') >= 0)
  ) {
    contentType = 'application/x-yaml';
  } else if (contentUri.endsWith('.json') || (contentUri.indexOf('.json/raw') >= 0)) {
    contentType = 'application/json';
  }

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
}

export default Object.assign(prototype, {
  makeURIByBaseURI(uri, baseURI) {
    let result;
    try {
      new URL(uri);
      result = uri;
    } catch (e) {
      if (!baseURI) {
        throw `Error in base URI ${uri}! Base URI is empty.`;
      }

      result = new URL(uri, baseURI);
    }
    return result.toString();
  },
  async request(url, propPath) {
    let result = null;
    if ((url === 'file:///$root$') && (propPath === '/')) {
      const content = makeBaseManifest();

      if (!content.imports) {
        content.imports = [];
      }

      if ((process.env.VUE_APP_DOCHUB_APPEND_DOCHUB_DOCS || 'y').toLowerCase() === 'y') {
        content.imports.push('/documentation/root.yaml');
      }
      if (process.env.VUE_APP_DOCHUB_ROOT_MANIFEST) {
        content.imports.push(process.env.VUE_APP_DOCHUB_ROOT_MANIFEST);
      }
      result = {
        data: content
      };
    } else {
      result = await request(url);
    }
    return result;
  }
});

export {
  makeBaseManifest,
  getFullPath,
  mainFullPath
};


import prototype from '@global/manifest/services/cache.mjs';
import uriTool from '@front/helpers/uri';
import requests from '@front/helpers/requests';

export default Object.assign(prototype, {
  // Выполняет resolve URL
  makeURIByBaseURI: uriTool.makeURIByBaseURI,

  // Выполняет запрос к данным
  request: requests.request.bind(requests)
});

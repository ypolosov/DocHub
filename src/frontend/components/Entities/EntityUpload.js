import mustache from 'mustache';

import datasets from '@front/helpers/datasets';
import requests from '@front/helpers/requests';

function doUpload(content, mime) {
  const base64 = window.btoa(unescape(encodeURIComponent(content)));
  const link = document.createElement('a');
  document.body.appendChild(link);
  link.href = `data:${mime};base64,${base64}`;
  link.download = `dh_${Date.now()}.${mime.split('/').pop()}`;
  link.click();
}

// Выгружает документы типа upload
//  id          - идентификатор документа
//  profile     - профиль документа
//  baseURI     - Базовый URI 
//  params      - Параметры передаваемые в документ
//  manifest    - архитектурный манифест
export const uploadDocument = function(profile, baseURI, params, manifest) {
  const provider = datasets();
  return new Promise((success, reject) => {
      if (profile.template) {
        requests.request(profile.template, baseURI).then(({ data }) => {
          let content = data;
          provider.getData(manifest, profile, params)
          .then((dataset) => {
            try {
              success(doUpload(mustache.render(content, dataset), profile.mimetype || 'text/plain'));
            } catch (e) {
              reject(e);
            } 
          })
          .catch((e) => reject(e));
        }).catch((e) => reject(e));
      } else {
        provider.getData(manifest, profile, params)
        .then((dataset) => {
          try {
            success(doUpload(JSON.stringify(dataset, null, 2), 'application/json'));
          } catch (e) {
            reject(e);
          } 
        });
      }
  });
};

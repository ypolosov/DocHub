import requests from "./requests";
import docs from './docs'
import jsonata from 'jsonata';

export default {
    evalRequest(context, datasetId, resolve, reject, data) {
        const dataset = (context.datasets || {})[datasetId];
        if (dataset) {
            const url = docs.urlFromProfile({source: dataset.query},
                (window.Vuex.state.sources.find((item) => item.path === `/datasets/${datasetId}`) || {}).location
            );
            if (url) {
                requests.request(url).then((response) => {
                    resolve(jsonata(typeof response.data === 'string' ? response.data : JSON.stringify(response.data)).evaluate(data || context));
                }).catch(() => reject);
            } else reject(`Can not resolve source of dataset [${datasetId}]`);
        } else reject(`Not found dataset [${datasetId}]`);
    },

    get(context, datasetId) {
        return new Promise((resolve, reject) => {
            const dataset = (context.datasets || {})[datasetId];
            if (dataset.data) {
                if(typeof dataset.data === 'string') {
                    if (/(\s+|)\((.*?)(\)(\s+|))$/.test(dataset.data)) {
                        resolve(jsonata(dataset.data).evaluate(context), datasetId);
                        return;
                    }
                } else if ((typeof dataset.data === 'object') && !Array.isArray(dataset.data)) {
                    let counter = 0;
                    const data = {};
                    for (const key in dataset.data) {
                        ++counter;
                        this.get(context, dataset.data[key]).then((content) => {
                            data[key] = content;
                            if(!--counter) {
                                this.evalRequest(context, datasetId, resolve, reject, data);
                            }
                        });
                    }
                }
            } else {
                this.evalRequest(context, datasetId, resolve, reject);
            }
        });     
    }
}

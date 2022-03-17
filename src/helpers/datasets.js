import requests from "./requests";
import docs from './docs'
import jsonata from 'jsonata';

export default {
    // Парсит поле данных в любом объекте
    //      context - Контекст данных для выполнения запросов
    //      data - данные требующие парсинга
    //      baseURI - URI владельца поля данных
    parseData(context, data, baseURI) {
        return new Promise((resolve, reject) => {
            if(typeof data === "object") {
                resolve(JSON.parse(JSON.stringify(data)));
              } else if (typeof data === "string") {
                  if (data.slice(-8) === ".jsonata") {
                    const url = docs.urlFromProfile({source: data}, baseURI);
                    requests.request(url).then((response) => {
                        resolve(jsonata(typeof response.data === 'string' 
                            ? response.data 
                            : JSON.stringify(response.data)).evaluate(context)
                        );
                    }).catch((e) => reject(e));
                  } else if (/(\s+|)\(((.*|\d|\D)+?)(\)(\s+|))$/.test(data)) {
                    resolve(jsonata(data).evaluate(context));
                  } else {
                    this.get(context, data).then((data) => resolve(data)).catch((e) => reject(e));  
                  }
              } else reject(`Ошибка истоника данных ${data} [${baseURI}]`);        
        });
    },

    // Загружает файл запроса и выполняет его для DataSet
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

    // Возвращает данные из DataSet
    get(context, datasetId) {
        return new Promise((resolve, reject) => {
            const dataset = (context.datasets || {})[datasetId];
            if (dataset.data) {
                if(typeof dataset.data === 'string') {
                    this.parseData(context, datasetId).then((data) => resolve(data)).catch((e) => reject(e));
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
                        }).catch(() => reject(`Ошибка данных в DataSet [${datasetId}]`));
                    }
                } else reject(`Ошибка данных в DataSet [${datasetId}]`);
            } else {
                this.evalRequest(context, datasetId, resolve, reject);
            }
        });     
    }
}

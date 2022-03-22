import requests from "./requests";
import docs from './docs'
import jsonata from 'jsonata';

export default function () {
    return {
        // eslint-disable-next-line no-unused-vars
        dsResolver(datasetID) {
            return null;
        },
        // Парсит поле данных в любом объекте
        //      context - Контекст данных для выполнения запросов
        //      data - данные требующие парсинга
        //      baseURI - URI владельца поля данных
        parseData(context, data, baseURI) {
            return new Promise((resolve, reject) => {
                // Константные данные
                if(typeof data === "object") {
                    resolve(JSON.parse(JSON.stringify(data)));
                } else if (typeof data === "string") {
                    // Ссылка на файл с запросом
                    if (data.slice(-8) === ".jsonata") {
                        const url = docs.urlFromProfile({source: data}, baseURI);
                        requests.request(url).then((response) => {
                            resolve(jsonata(typeof response.data === 'string' 
                                ? response.data 
                                : JSON.stringify(response.data)).evaluate(context)
                            );
                        }).catch((e) => reject(e));
                    // Inline запрос JSONata
                    } else if (/(\s+|)\(((.*|\d|\D)+?)(\)(\s+|))$/.test(data)) {
                        resolve(jsonata(data).evaluate(context));
                    // Идентификатор источника данных
                    } else {
                        const dataSet = this.dsResolver(data);
                        if (dataSet.subject) {
                            this.getData(context, dataSet.subject, dataSet.baseURI)
                            .then((data) => resolve(data))
                            .catch((e) => reject(e))
                        } else reject(`Не найден источник данных [${data}] [${baseURI}]`);
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
                        resolve(
                            jsonata(typeof response.data === 'string' 
                            ? response.data 
                            : JSON.stringify(response.data)).evaluate(data || context)
                        );
                    }).catch(() => reject);
                } else reject(`Can not resolve source of dataset [${datasetId}]`);
            } else reject(`Not found dataset [${datasetId}]`);
        },

        // Возвращает данные по субъекту
        //  context - данные для запроса
        //  subject - субъект данных
        //  baseURI - URI субъекта
        getData(context, subject, baseURI) {
            return new Promise((resolve, reject) => {
                const exec = (origin) => {
                    this.parseData(origin, subject.data, baseURI)
                    .then((data) => resolve(data))
                    .catch((e) => reject(e));
                };
                if (subject.data) {
                    if (subject.origin) {
                        if(typeof subject.origin === 'string') {
                            this.parseData(context, subject.origin, baseURI)
                            .then((data) => exec(data))
                            .catch((e) => reject(e));
                        } else if ((typeof subject.origin === 'object') && !Array.isArray(subject.origin)) {
                            let counter = 0;
                            const data = {};
                            for (const key in subject.origin) {
                                ++counter;
                                this.parseData(context, subject.origin[key], baseURI).then((content) => {
                                    data[key] = content;
                                    if(!--counter) exec(data);
                                }).catch((e) => reject(e));
                            }
                        } else reject(`Ошибка данных [${baseURI}]`);
                    } else exec(context);
                } else resolve (null); // Нет данных
            });
        }
    }
}

import requests from '../helpers/requests';
import consts from '@/consts'
import parser from  './parser'

// События манифеста
const EVENTS = consts.manifest.events;

const loader = {
    // Счетчик запросов по импорту манифестов
    rootURI: null,
    importCounter: 0,
    // Отправляет событие в основной поток 
    sendEvent(event, data) {
        postMessage(JSON.stringify(Object.assign({event}, data)));
    },

    // uri - подключаемый манифест
    import(uri) {
        return new Promise((resole, rject) => {
            // Инкрементируем счетчик запущенных загрузок
            this.importCounter++;
            // Генерируем событие о начале импорта подключаемого манифеста
            this.sendEvent(EVENTS.IMPORTING, { uri });

            // Выполняем запрос
            requests.request(uri).then((response) => {
                resole(parser(
                    typeof response.data === 'object' ? response.data : JSON.parse(response.data),
                    this
                ));
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.error(consts.manifest.wokers.LOADER, `Error of importing maifest [${uri}].`, error);
                this.sendEvent(EVENTS.IMPORT_ERROR, { uri, error: error.toString() })
                rject(error);
            })
            .finally(() => {
                // Генерируем событие о завершении загрузки манифеста
                this.sendEvent(EVENTS.IMPORTED, { uri });
                if(--this.importCounter <= 0) {
                    // Если это последний импорт в пакете загрузки, то генерируем события завершения загрузки манифеста
                    postMessage(EVENTS.LOADED, { uri: this.rootURI });
                }
            });
        });
    },

    // uri - корневой манифест
    load(uri) {
        if (this.importCounter > 0) {
            // eslint-disable-next-line no-console
            console.error(consts.manifest.wokers.LOADER, `Error of loding maifest [${uri}]. Manifest is already loading from [${this.rootURI}].`);
            return;
        }

        this.rootURI = uri;

        // Генерируем событие о начале загрузки манифеста
        this.sendEvent(EVENTS.LOADING, { uri });
        this.import(uri);
    }
};

export default loader;
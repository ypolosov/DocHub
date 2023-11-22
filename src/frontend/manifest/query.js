import jsonataDriver from '@global/jsonata/driver.mjs';
import queries from '@global/jsonata/queries.mjs';
import env from '@front/helpers/env';
import requests from '@front/helpers/requests';

// Возвращает тело запроса в зависимости от платформы развертывания
function resolveJSONataRequest(ID, params) {
    let result = null;
    if (env.isBackendMode()) {
        result = `backend://jsonata/${encodeURIComponent(ID)}`;
        params && (result += `?params=${encodeURIComponent(JSON.stringify(params))}`);
    } else {
        result = queries.makeQuery(queries.QUERIES[ID], params);
    }
    return result;
}

const queryDriver = {
    driver: jsonataDriver,
    expression(expression, self_, params, isTrace, funcs) {
        return {
            driver: this.driver,
            expOrigin: null,
            onError: null,
            async evaluate(context, def) {
                let result = null;
                try {
                    if (expression.startsWith('backend://')) {
                        const url = new URL(expression);
                        [
                            { field: 'params', value: params},
                            { field: 'subject', value: self_}
                        ].map((param) => {
                            if (!param.value) return;
                            const oldValue = JSON.parse(url.searchParams.get(param.field));
                            const newValue = Object.assign({}, params, oldValue);
                            url.searchParams.set(param.field, JSON.stringify(newValue));
                        });
                        result = (await requests.request(url)).data;
                    } else if (!context && env.isBackendMode()) {
                        let url = `backend://jsonata/${encodeURIComponent(expression)}`;
                        url += `?params=${encodeURIComponent(JSON.stringify(params || null))}`;
                        url += `&subject=${encodeURIComponent(JSON.stringify(self_ || null))}`;
                        result = (await requests.request(url)).data;
                    } else {
                        !this.expOrigin && (this.expOrigin = this.driver.expression(expression, self_, params, isTrace || env.isTraceJSONata, funcs));
                        result = await this.expOrigin.evaluate(context || window.Vuex.state.manifest || {});
                    }
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error(e);
                    throw e;
                }
                return result || def;
            }
        };
    },

    // ********** МЕНЮ *************
    menu() {
        return resolveJSONataRequest(queries.IDS.USER_MENU);
    },

    // ********** ТЕХНОЛОГИИ ***********
    // Сбор информации об использованных технологиях
    collectTechnologies() {
        return resolveJSONataRequest(queries.IDS.TECHNOLOGIES);
    },
    // Карточка технологии
    summaryForTechnology(technology) {
        return resolveJSONataRequest(queries.IDS.TECHNOLOGY, { TECH_ID: technology });
    },

    // ********** СУЩНОСТИ ***********
    
    // Документы для сущности
    docsForSubject(entity) {
        return resolveJSONataRequest(queries.IDS.DOCUMENTS_FOR_ENTITY, { ENTITY: entity });
    },

    // Сводная JSONSchema по всем кастомным сущностям
    entitiesJSONSchema() {
        return resolveJSONataRequest(queries.IDS.JSONSCEMA_ENTITIES);
    },

    // Сводная JSONSchema по всем кастомным сущностям
    getObject(id) {
        return resolveJSONataRequest(queries.IDS.GET_OBJECT, { OBJECT_ID: id });
    }
};

jsonataDriver.customFunctions = () => {
    const result = {};
    const functions = window.Vuex?.state?.manifest?.functions || {};
    for (const funcId in functions) {
        const func = {
            profile: functions[funcId],
            executor: null
        };
        result[funcId] = async(params) => {
            if(!func.executor) {
                func.executor = queryDriver.expression(func.profile?.code || 'undefined');
            }
            return func.executor.evaluate(params);
        };
    }
    return result;
};

export default queryDriver;

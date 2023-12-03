// Создает исполняющие ручки функций

import ajv from 'ajv';
// import ajv_localize from 'ajv-i18n/localize/ru';

// Генерирует валидатор входных параметров
function makeParamsValidator(handler) {
    // Если параметров нет, то проверять ничего не будем
    if (!handler.profile.params) return null;

    if (!Array.isArray(handler.profile.params))
        throw new Error(`Ошибка описания схемы входных параметров в функции [${handler.id}]!\nПараметры должны описываться массивом.`);

    const schema = {
        type: 'object',
        properties: {}
    };
    
    handler.profile.params.map((param, index) => {
        const alias = param.alias || `param${index}`;
        const vParam = Object.assign({}, param);
        delete vParam.alias;
        schema.properties[alias] = vParam;
    });

    try {
        const rules = new ajv({ allErrors: true });
        return rules.compile(schema);
    } catch (e) {
        throw new Error(`Ошибка схемы входных параметров в декларации функции [${handler.id}]\n${e.toString()}`);
    }
}

// Генерирует валидатор выходных данных
function makeResultValidator(handler) {
    // Если схемы нет, то проверять ничего не будем
    if (!handler.profile.result) return null;

    const schema = handler.profile.result;

    try {
        const rules = new ajv({ allErrors: true });
        return rules.compile(schema);
    } catch (e) {
        throw new Error(`Ошибка схемы результата в декларации функции [${handler.id}]\n${e.toString()}`);
    }
}

// Генерирует валидаторы входных и выходных данных
function makeValidators(handler) {
    handler.validators = {
        input: makeParamsValidator(handler),
        output: makeResultValidator(handler)
    };
}

// Подготавливает входящие данные и проверяет из структуру
function prepareParams(handler, params) {
    // Если валидатора нет, ничего не проверяем
    const validator = handler.validators.input;
    if (!validator) return null;

    // Готовим параметры на вход
    const result = {};
    handler.profile.params.map((param, index) => {
        const alias = param.alias || `param${index}`;
        result[alias] = params[index];
    });

    // Проверяем по схеме
    if (!validator(result)) {
        // ajv_localize(validator.errors);
        throw new Error(`Ошибка валидации входных параметров функции [${handler.id}]\n${JSON.stringify(validator.errors, null, 4)}`);
    }

    return result;
}

// Проверяет результат функции по схеме
function prepareResult(handler, result) {
    // Проверяем по схеме
    const validator = handler.validators.output;
    // Если валидатора нет, ничего не проверяем
    if (!validator) return result;

    // Проверяем по схеме
    if (!validator(result)) {
        // ajv_localize(validator.errors);
        throw new Error(`Ошибка валидации результата функции [${handler.id}]\n${JSON.stringify(validator.errors, null, 4)}`);
    }

    return result;
}

export default (queryDriver, functions) => {
    const result = {};

    for (const funcId in functions) {
        const func = {
            id: funcId,
            profile: functions[funcId],
            executor: null
        };
        result[funcId] = async(...params) => {
            !func.validators && makeValidators(func);
            if (!func.executor) {
                func.executor = queryDriver.expression(func.profile?.code || 'undefined');
            }
            return prepareResult(func,              // Проверяем результат на корректность
                await func.executor.evaluate(
                    prepareParams(func, params)     // Подготавливаем параметры и проверяем их на корректность
                )
            );
        };
    }

    return result;
};

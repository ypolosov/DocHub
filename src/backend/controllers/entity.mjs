// Модуль реализующий доступ к презентациям сущностей как API 
// Формат доступа /entities/[Идентификатор сущности]/presentations/[Идентификатор презентации]?[параметры]

import cache from '../storage/cache.mjs';
import datasets from '../helpers/datasets.mjs';
import helpers from './helpers.mjs';
import ajv from 'ajv';
import mustache from 'mustache';
import request from '../helpers/request.mjs';
import md5 from 'md5';

export default function(app) {

    // Рендерит презентацию сущности
    app.get('/entities/:entity/presentations/:presentation', async(req, res) => {
        // Проверяем, что готовы обрабатывать запросы
        if (!helpers.isServiceReady(app, res)) return;

        const entityID = req.params.entity;
        const presentationID = req.params.presentation;

        if (!entityID || !presentationID) {
            res.status(400).json({ message: 'Error of URI path /entities/[Entity ID]/presentations/[Presentation ID]?[params]' });
            return;
        }

        // Проверяем есть ли Entity
        const entity = app.storage.manifest?.entities[entityID];
        if (!entity) {
            res.status(404).json({ message: `Not found entity [${entityID}]` });
            return;
        }

        // Проверяем есть ли презентация
        const presentation = (app.storage.manifest.entities[entityID].presentations || {})[presentationID];
        if (!presentation) {
            res.status(404).json({ message: `Not found presentation [${presentationID}] for entity [${entityID}]` });
            return;
        }

        // Определяем тип документа
        const docType = (presentation.type || '').toLowerCase();
        const path = `/entities/${entityID}/presentations/${presentationID}`;
        if (docType !== 'upload') {
            res.status(405).json({ message: `Document type [${docType}] not supported for sever mode. Location [${path}]`});
            return;
        }

        const entityParams = req.query;

        //Проверяем, что есть поле template
        const templateSource = presentation.template;
        // Необязательно
        //if (!templateSource) {
        //    res.status(500).json({ message: `Not found required field [template]. Location [${path}]`});
        //    return;
        //}

        // Проверяем параметры
        if (presentation.params) {
            try {
                const rules = new ajv({ allErrors: true });
                const validator = rules.compile(presentation.params);
                if (!validator(entityParams)) {
                    res.status(400).json({
                        message: `Error of params presentation [${presentationID}] for entity [${entityID}]`,
                        error: validator.errors
                    });
                    return;
                }
            } catch (e) {   
                res.status(500).json({
                    message: `Error schema of params for presentation [${presentationID}] of entity [${entityID}]`,
                    error: e.toString(),
                    params: presentation.params
                });
                return;
            }
        }

        // Получаем данные для генерации ответа
        try {
            const cacheKey = JSON.stringify({entity: entityID, presentation: presentationID, params: entityParams});
            const data = await cache.pullFromCache(app.storage.hash, cacheKey, async()=> {
                return await datasets(app).releaseData(path, entityParams);
            });

            // Если шаблон есть, рендерим его
            if (templateSource) {
                const baseURL = app.storage?.md5Map[md5(path)];

                const template = (await request(templateSource, baseURL)).data;
                const content = mustache.render(template, data);

                res.setHeader('Content-Type', presentation.mimetype || 'text/plain').send(content);
            } else {
                res.json(data);
            }
        } catch(e) {
            res.json({
                message: e.message,
                error: e
            });
        }
    });
}

import requests from './requests';
import gitlab from "./gitlab";
import jsonata from 'jsonata';

let touchProjects = {};
let reqCounter = 0;

export default {
    // Манифест перезагружен
    onReloaded: null,
    // Счетчик запросов
    reqCounter : 0,
    incReqCounter() {
        this.reqCounter++;
    },
    decReqCounter() {
        if(!--this.reqCounter && this.onReloaded)
            this.onReloaded(this);
    },
    // Режимы манифестов
    MODE_AS_IS : 'as-is', // Как есть
    MODE_AS_WAS : 'as-was', // Как было
    MODE_TO_BE : 'to-be', // Как будет
    // Журнал объединений
    margeMap: [],
    // Итоговый манифест
    manifest: {},
    // Склеивание манифестов
    // distanation - Объект с которым происходит объединение. Низкий приоритете.
    // source - Объект с которым происходит объединение. Высокий приоритете.
    // location - Размещение объекта source (сточник изменений)
    // path - Путь к объекту
    merge(destination, source, location, path) {
        let result;
        if (Array.isArray(source)) {
            if (Array.isArray(destination)) {
                result = JSON.parse(JSON.stringify(destination)).concat(JSON.parse(JSON.stringify(source)));
            } else {
                result = JSON.parse(JSON.stringify(source));
            }
        } else if (typeof source === 'object') {
            result = JSON.parse(JSON.stringify(destination));
            typeof result !== 'object' && (result = {});
            for (const id in source) {
                if (result[id]) {
                    result[id] = this.merge(result[id], source[id], location, `${path || ''}/${id}`);
                } else {
                    result[id] = JSON.parse(JSON.stringify(source[id]));
                }
            }
        } else {
            result = JSON.parse(JSON.stringify(source));
        }
        this.margeMap.push({
            path,
            source: JSON.stringify(result)
        });
        return result;
    },

    // Возвращает контекст свойства по заданному пути
    // path - пусть к свойству
    getManifestContext (path) {
        let node = this.manifest;
        const keys = path.split('/');
        for (let i = 0; i < keys.length - 1; i++) {
            const key = decodeURIComponent(keys[i]);
            node = node[key] || (node[key] = {});
        }
        const property = decodeURIComponent(keys.pop());
        return {
            node,
            property,
            data: node[property]
        }
    },

    // Декомпозирует свойство манифеста
    // Если свойство содержит ссылку, загружает объект
    // data - Значение свойства
    // path - пусть к совйству от корня манифеста
    expandProperty (path, baseURI) {
        const data = this.getManifestContext(path).data;
        // Если значение ялвяется ссылкой, загружает объект по ссылке
        if (typeof data === 'string') {
            const URI = requests.makeURIByBaseURI(data, baseURI);
            this.incReqCounter();
            requests.request(URI).then((response) => {
                const context = this.getManifestContext(path);
                context.node[context.property] = response.data;
                this.touchProjects(URI);
            })
                // eslint-disable-next-line no-console
                .catch((e) => console.error(e, URI))
                .finally(() => this.decReqCounter())
        }
    },
    // Разбираем сущности
    // path - путь к перечислению сущьностей (ключ -> объект)
    parseEntity(path, baseURI) {
        const context = this.getManifestContext(path);
        for (const key in context.data) {
            this.expandProperty(`${path}/${encodeURIComponent(key)}`, baseURI);
        }
    },

    // Детектит обращение к проектам
    touchProjects (location, callback) {
        const projectID = requests.getGitLabProjectID(location);
        let URI;
        if (projectID && !touchProjects[projectID]) {
            touchProjects[projectID] = {};
            URI = gitlab.projectLanguagesURI(projectID);
            reqCounter++;
            requests.request(URI).then((response) => {
                callback('project/languages', {
                    projectID: projectID,
                    content: typeof response.data === "string" ? JSON.parse(response.data) : response.data,
                });
            })
                // eslint-disable-next-line no-console
                .catch((e) => console.error(e, URI))
                .finally(() => reqCounter--)
        }
    },

    parseNode (node, baseURI, callback) {
        // Определяет тип значения.
        // Если значение ялвяется ссылкой, загружает объект по ссылке
        if (typeof node === 'string') {
            const URI = requests.makeURIByBaseURI(node, baseURI);
            reqCounter++;
            requests.request(URI).then((response) => {
                this.touchProjects(URI, callback);
                callback({
                    content: typeof response.data === "string" ? JSON.parse(response.data) : response.data,
                    location: URI,
                    source: response.config.source
                });
            })
            // eslint-disable-next-line no-console
            .catch((e) => console.error(e, URI))
            .finally(() => reqCounter--)
        } else {
            // Иначе парсим
            this.touchProjects(baseURI, callback);
            callback({
                content: node,
                location: baseURI
            });
        }
    },

    // Разбираем аспекты
    parseAspects(aspects, baseURI, callback) {
        for (const id in aspects) {
            this.parseNode(aspects[id], baseURI,(node) => {
                callback('aspect', Object.assign({ id : id}, node));
            });
        }
    },

    // Разбираем компонент
    parseComponent(component, baseURI, callback) {
        // Разбираем контексты представления компонента
        (component.content.presentations || []).map((presentation) => {
            (presentation.contexts || ['global']).map((context) => {
                callback('presentation', {
                    id: component.id,
                    context: context,
                    entity: presentation.entity || '@component',
                    requires: presentation.requires
                });
            });
        });
        // Разбираем аспекты участия компонента
        (component.content.aspects || []).map((aspectID) => {
            callback('aspect', {
                id: aspectID,
                content: {},
                component: component.id
            });
        });
    },

    // Разбираем список компонентов
    parseComponents(components, baseURI, callback) {
        for (const id in components) {
            this.parseNode(components[id], baseURI,(node) => {
                const component = Object.assign({ id : id}, node);
                callback('component', component);
                this.parseComponent(component, baseURI, callback);
            });
        }
    },

    // Разбираем список контекстов
    parseContexts(contexts, baseURI, callback) {
        for (const id in contexts) {
            callback('context', {id, content: contexts[id]});
        }
    },

    // Разбираем список форм
    parseForms(forms, baseURI, callback) {
        forms.map((form) => callback('form', form));
    },

    // Разбираем список документов
    parseDocs(docs, baseURI, callback) {
        for(const id in docs) {
            const doc = docs[id];
            // Устаревший формат
            if ((doc.transport || '').toLowerCase() === 'gitlab') {
                doc.source = `gitlab:${doc.project_id}:${doc.branch}@${doc.source}`;
            }
            callback('doc', {
                id,
                content: doc
            });
        }
    },

    // Подключение манифеста
    import(uri, callback, subimport) {
        if (!subimport) {
            this.manifest = {};
            this.margeMap = [];
            reqCounter = 0;
            touchProjects = {};
            let watcher = setInterval(() => {
                if (reqCounter === 0) {
                    // eslint-disable-next-line no-console
                    console.info(this.manifest);
                    callback('end');
                    reqCounter = null;
                    clearInterval(watcher);
                }
            }, 100)
            callback('begin');
        }

        this.incReqCounter();
        reqCounter++;
        this.touchProjects(uri, callback);
        requests.request(uri).then((response) => {
            const manifest = typeof response.data === 'object' ? response.data : JSON.parse(response.data);

            // Определяем режим манифеста
            // eslint-disable-next-line no-unused-vars
            const mode = manifest.mode || this.MODE_AS_IS;
            this.manifest[mode] = this.merge(this.manifest[mode] || {}, manifest, uri);

            // Подключаем манифесты
            (jsonata('imports').evaluate(response.data) || []).map((importUri) => {
                this.import(requests.makeURIByBaseURI(importUri, uri), callback, true);
            });

            for (const section in this.manifest[mode]) {
                ['forms', 'namespaces', 'aspects', 'docs', 'contexts'].indexOf(section) >= 0
                 && section !== 'imports' && this.parseEntity(`${mode}/${section}`, uri);
            }

            for (const section in response.data) {
                const data = response.data[section];
                switch (section) {
                    case 'technologies':
                        break;
                    case 'forms':
                        this.parseForms(data, uri, callback);
                        break;
                    case 'namespaces':
                        break;
                    case 'imports':
                        /*
                        response.data.imports.map((importUri) => {
                            this.import(requests.makeURIByBaseURI(importUri, uri), callback, true);
                        });
                        */
                        break;
                    case 'aspects':
                        this.parseAspects(data, uri, callback);
                        break;
                    case 'components':
                        this.parseComponents(data, uri, callback);
                        break;
                    case 'contexts':
                        this.parseContexts(data, uri, callback);
                        break;
                    case 'docs':
                        this.parseDocs(data, uri, callback);
                        break;
                    default:
                        throw `Error manifest section [${section}] at ${response.config.url}`
                }
            }
        })
        // eslint-disable-next-line no-console
        .catch((e) => console.error(e))
        .finally(() => {
            reqCounter--;
            this.decReqCounter();
        });
    }
};

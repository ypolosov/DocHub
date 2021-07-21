import requests from './requests';
import gitlab from "./gitlab";

let reqCounter = null;
let touchProjects = {};

export default {
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
            reqCounter = 0;
            touchProjects = {};
            let watcher = setInterval(() => {
                if (reqCounter === 0) {
                    callback('end');
                    reqCounter = null;
                    clearInterval(watcher);
                }
            })
            callback('begin');
        }

        reqCounter++;
        this.touchProjects(uri, callback);
        requests.request(uri).then((response) => {
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
                        response.data.imports.map((importUri) => {
                            this.import(requests.makeURIByBaseURI(importUri, uri), callback, true);
                        });
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
        .finally(() => reqCounter--);
    }
};

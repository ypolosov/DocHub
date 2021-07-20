import requests from './requests';

let reqCounter = null;

export default {
    // Определяет тип значения.
    // Если сзначение ялвяется ссылкой, загружает объект по ссылке
    parseNode (node, baseURI, callback) {
        if (typeof node === 'string') {
            const URI = requests.makeURIByBaseURI(node, baseURI);
            reqCounter++;
            requests.request(URI).then((response) => {
                callback({
                    content: typeof response.data === "string" ? JSON.parse(response.data) : response.data,
                    location: URI
                });
            })
            // eslint-disable-next-line no-console
            .catch((e) => console.error(e, URI))
            .finally(() => reqCounter--)
        } else {
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
                    shape: presentation.shape || '@component',
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
        requests.request(uri).then((response) => {
            for (const section in response.data) {
                const data = response.data[section];
                switch (section) {
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

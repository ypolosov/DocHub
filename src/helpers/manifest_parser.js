import requests from './requests';

export default {
    parseComponent(component, baseURI, callback) {
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
    },
    parseComponents(components, baseURI, callback) {
        for (const id in components) {
            if (typeof components[id] === 'string') {
                const componentURI = requests.makeURIByBaseURI(components[id], baseURI);
                requests.request(componentURI).then((response) => {
                    const component = {
                        id,
                        content: typeof response.data === "string" ? JSON.parse(response.data) : response.data,
                        location: componentURI
                    };
                    callback('component', component);
                    this.parseComponent(component, baseURI, callback);
                })
                    // eslint-disable-next-line no-console
                    .catch((e) => console.error(e, componentURI));
            } else {
                const component = {
                    id,
                    content: components[id],
                    location: baseURI
                };
                callback('component', component);
                this.parseComponent(component, baseURI, callback);
            }
        }
    },
    parseContexts(contexts, baseURI, callback) {
        for (const id in contexts) {
            callback('context', {id, content: contexts[id]});
        }
    },
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
    import(uri, callback) {
        requests.request(uri).then((response) => {
            for (const section in response.data) {
                const data = response.data[section];
                switch (section) {
                    case 'imports':
                        response.data.imports.map((importUri) => {
                            this.import(requests.makeURIByBaseURI(importUri, uri), callback);
                        });
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
            .catch((e) => console.error(e));
    }
};

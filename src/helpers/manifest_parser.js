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
                requests.request(requests.makeURIByBaseURI(components[id], baseURI)).then((response) => {
                    const component = {
                        id,
                        content: response.data
                    };
                    callback('component', component);
                    this.parseComponent(component, baseURI, callback);
                })
                    // eslint-disable-next-line no-console
                    .catch((e) => console.error(e));
            } else {
                const component = {
                    id,
                    content: components[id]
                };
                callback('component', component);
                this.parseComponent(component, baseURI, callback);
            }
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
                switch (section) {
                    case 'imports':
                        response.data.imports.map((importUri) => {
                            this.import(requests.makeURIByBaseURI(importUri, uri), callback);
                        });
                        break;
                    case 'components':
                        this.parseComponents(response.data.components, uri, callback);
                        break;
                    case 'docs':
                        this.parseDocs(response.data.docs, uri, callback);
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

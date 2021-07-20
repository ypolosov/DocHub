import config from '../../config'
import cookie from 'vue-cookie';
import GitHelper from '../helpers/gitlab'
import parser from '../helpers/manifest_parser';
import Vue from 'vue';

const axios = require('axios');

export default {
    state: {
        is_reloading: false,
        access_token: null,
        available_projects: {},
        docsStructure: { nodes: {} },
        docs: {},
        presentations: { nodes: {}, components: {} },
        aspects: {},
        contexts: {},
        components: {},
        selected_doc: null,
        diff_format: 'line-by-line',
        last_changes: {},
    },

    mutations: {
        setIsReloading(state, value) {
            state.is_reloading = value;
        },
        setAccessToken(state, value) {
            state.access_token = value;
            cookie.set('git_access_token', value, 1);
        },
        setDiffFormat(state, value) {
            state.diff_format = value;
            cookie.set('diff_format', value, 1);
        },
        clearDocs(state) {
            state.docs = {};
            state.docsStructure = { nodes: {} };
        },
        appendDoc(state, value) {
            // Добавляем документ в индекс
            state.docs = Object.assign({[value.id]: value.content}, state.docs);

            // Добавляем документ в навигацию
            const nodes = value.content.location.split('/');
            let curNode = state.docsStructure;
            nodes.map((node, index) => {
                curNode = curNode.nodes[node] || (curNode.nodes[node] = { nodes: {} });
                if (nodes.length - 1 === index) {
                    curNode.doc = value.content;
                }
            });
            state.docsStructure = Object.assign({}, state.docsStructure);
        },
        clearAspects(state) {
            state.aspects = {};
        },
        setAspects(state, value) {
            state.aspects = value;
        },
        clearComponents(state) {
            state.components = {};
        },
        setComponents(state, value) {
            state.components = value;
        },
        clearPresentations(state) {
            state.presentations = { nodes: {}, components: {} };
        },
        setPresentations(state, value) {
            state.presentations = value;
        },
        clearContexts(state) {
            state.contexts = {};
        },
        setContexts(state, value) {
            state.contexts = value;
        },
        clearAvailableProjects(state) {
            state.available_projects = {};
        },
        appendAvailableProjects(state, value) {
            Vue.set(state.available_projects, value.id, value);
        },
        setSelectedDocument(state, value) {
            state.selected_doc = value;
        },
        clearLastChanges(state) {
            state.last_changes = {};
        },
        appendLastChanges(state, value) {
            Vue.set(state.last_changes, value.id, value.payload);
        },

    },

    actions: {
        // Action for init store
        init(context) {
            const access_token = cookie.get('git_access_token');
            if (access_token) {
                context.commit('setAccessToken', access_token);
                context.dispatch('reloadAll');
            }
            let diff_format = cookie.get('diff_format');
            context.commit('setDiffFormat', diff_format ? diff_format : context.state.diff_format);
        },

        // Need to call when gitlab takes callback's rout with oauth code
        onReceivedOAuthToken(context, access_token) {
            context.commit('setAccessToken', access_token);
            context.dispatch('reloadAll');
        },

        // Reload root manifest
        reloadAll(context) {
            context.dispatch('reloadRootManifest');
        },

        // Search and set document by URI
        selectDocumentByURI(context, uri) {
            for (let key in context.state.docs) {
                let document = context.state.docs[key];
                if (document.uri.toString() === uri) {
                    context.dispatch('selectDocument', document);
                    break;
                }
            }
        },

        // Set selected document
        selectDocument(context, document) {
            context.commit('setSelectedDocument', document);
        },

        // Reload root manifest
        updateLastChanges(context) {
            let request = new function () {
                this.terminate = false;
                this.projects_tasks = {};

                this.loadLastChange = (doc) => {
                    axios({
                        method: 'get',
                        url: GitHelper.commitsListURI(doc.project_id, doc.branch, 1, doc.source, 1),
                        headers: {'Authorization': `Bearer ${context.state.access_token}`}
                    })
                        .then((response) => {
                            if (!this.terminate) {
                                context.commit('appendLastChanges', {
                                    id: doc.id,
                                    payload: response.data
                                });
                            }
                        });
                };

                this.stop = () => {
                    this.terminate = true;
                }
            };

            for (let id in context.state.docs) {
                let doc = context.state.docs[id];
                if ((doc.transport || '').toLowerCase() === 'gitlab') {
                    request.loadLastChange(doc);
                }
            }
        },

        // Reload root manifest
        reloadRootManifest(context) {
            const cache = {
                aspects: {},
                contexts: {},
                components: {},
                presentations: { nodes: {}, components: {} },
            };
            parser.import(
                `gitlab:${config.root_manifest.project_id}:${config.root_manifest.branch}@dochub.json`,
                (action, data) => {
                    switch (action) {
                        case 'begin':
                            context.commit('setIsReloading', true);
                            break;
                        case 'aspect': {
                            const aspect = cache.aspects[data.id]
                                ? Object.assign(data.content, cache.aspects[data.id])
                                : data.content;
                            !aspect.locations && (aspect.locations = []);
                            data.location && aspect.locations.push(data.location);
                            !aspect.components && (aspect.components = []);
                            data.component && aspect.components.push(data.component);
                            cache.aspects = Object.assign(cache.aspects, {[data.id]: aspect});
                            break;
                        }
                        case 'component': {
                            const component = cache.components[data.id]
                                ? Object.assign(cache.content, cache.components[data.id])
                                : data.content;

                            !component.locations && (component.locations = []);
                            component.locations.push(data.location);

                            cache.components = Object.assign(cache.components, {[data.id]: component},);
                            break;
                        }
                        case 'presentation': {
                            const nodes = data.context.split('/');
                            let curNode = cache.presentations;
                            nodes.map((node) => {
                                curNode = node === 'global'
                                    ? cache.presentations
                                    : curNode.nodes[node] || (curNode.nodes[node] = {nodes: {}, components: {}})
                                ;
                                curNode.components[data.id] = data;
                            });
                            break;
                        }
                        case 'context':
                            cache.contexts[data.id] = data.content;
                            break;
                        case 'doc':
                            context.commit('appendDoc', data);
                            break;
                        case 'end':
                            context.commit('setContexts', cache.contexts);
                            context.commit('setPresentations', cache.presentations);
                            context.commit('setComponents', cache.components);
                            context.commit('setAspects', cache.aspects);
                            context.commit('setIsReloading', false);
                            break;
                    }
                }
            );
        }
    }
};

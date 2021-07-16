import config from '../../config'
import cookie from 'vue-cookie';
import GitHelper from '../helpers/gitlab'
import parser from '../helpers/manifest_parser';
import Vue from 'vue';

const axios = require('axios');

export default {
    state: {
        access_token: null,
        available_projects: {},
        docsStructure: { nodes: {} },
        docs: {},
        presentations: { nodes: {}, components: {} },
        contexts: {},
        components: {},
        selected_doc: null,
        diff_format: 'line-by-line',
        last_changes: {},
    },

    mutations: {
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
        clearComponents(state) {
            state.components = {};
        },
        appendComponent(state, value) {
            const component = state.components[value.id]
                ? Object.assign(value.content, state.components[value.id])
                : value.content;

            !component.locations && (component.locations = []);
            component.locations.push(value.location);

            state.components = Object.assign({ [value.id]: component }, state.components);
        },
        clearPresentations(state) {
            state.presentations = { nodes: {}, components: {} };
        },
        appendPresentation(state, value) {
            const nodes = value.context.split('/');
            let curNode = state.presentations;
            nodes.map((node) => {
                curNode = node === 'global'
                    ? state.presentations
                    : curNode.nodes[node] || (curNode.nodes[node] = { nodes: {}, components: {} })
                ;
                curNode.components[value.id] = value;
            });

            state.presentations = Object.assign({}, state.presentations);
        },
        clearContexts(state) {
            state.contexts = {};
        },
        appendContext(state, value) {
            state.contexts = Object.assign( {[value.id]: value.content}, state.contexts);
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
            parser.import(
                `gitlab:${config.root_manifest.project_id}:${config.root_manifest.branch}@dochub.json`,
                (action, data) => {
                    switch (action) {
                        case 'component':
                            context.commit('appendComponent', data);
                            break;
                        case 'presentation':
                            context.commit('appendPresentation', data);
                            break;
                        case 'context':
                            context.commit('appendContext', data);
                            break;
                        case 'doc':
                            context.commit('appendDoc', data);
                            break;
                    }
                }
            );
        }
    }
};

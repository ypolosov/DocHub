import config from '../../config'
import cookie from 'vue-cookie';
import GitHelper from '../helpers/gitlab'
const axios = require('axios');

let reload_manifest_request = null;

import Vue from 'vue';

export default {
    state: {
        access_token: null,
        available_projects: {},
        docs: {},
        selected_doc: null,
        diff_format: 'line-by-line',
        last_changes: {},
    },

    mutations: {
        setAccessToken (state, value) {
            state.access_token = value;
            cookie.set('git_access_token', value, 1);
        },
        setDiffFormat(state, value) {
            state.diff_format = value;
            cookie.set('diff_format', value, 1);
        },
        clearDocs (state) {
            state.docs = {};
        },
        appendDocs (state, value) {
            state.docs = Object.assign(value, state.docs);
        },
        clearAvailableProjects (state) {
            state.available_projects = {};
        },
        appendAvailableProjects (state, value) {
            Vue.set(state.available_projects, value.id, value);
        },
        setSelectedDocument (state, value) {
            state.selected_doc = value;
        },
        clearLastChanges (state) {
            state.last_changes = {};
        },
        appendLastChanges (state, value) {
            Vue.set(state.last_changes, value.id, value.payload);
        },

    },

    actions: {
        // Action for init store
        init(context) {
            const access_token = cookie.get('git_access_token');
            if(access_token) {
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
            for(let key in context.state.docs) {
                let document = context.state.docs[key];
                if(document.uri.toString() === uri) {
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
            let request = new function() {
                this.terminate = false;
                this.projects_tasks = {};

                this.loadLastChange = (doc) => {
                    axios({
                        method: 'get',
                        url: GitHelper.commitsListURI(doc.project_id, doc.branch, 1, doc.source, 1),
                        headers: { 'Authorization': `Bearer ${context.state.access_token}` }
                    })
                        .then((response) => {
                            if(!this.terminate) {
                                context.commit('appendLastChanges', {
                                    id : doc.id,
                                    payload: response.data
                                });
                            }
                        });
                };

                this.stop = () => {
                    this.terminate = true;
                }
            };

            for(let id in context.state.docs) {
                let doc = context.state.docs[id];
                if(doc.transport.toLowerCase() === 'gitlab') {
                    request.loadLastChange(doc);
                }
            }
        },

        // Reload root manifest
        reloadRootManifest(context) {
            let request_counter = 0;
            context.commit('clearDocs');
            let request = new function() {
                this.terminate = false;
                this.projects_tasks = {};

                this.loadProject = (project_id) => {
                    this.projects_tasks[project_id] = axios({
                        method: 'get',
                        url: GitHelper.projectSingleURI(project_id),
                        headers: { 'Authorization': `Bearer ${context.state.access_token}` }
                    })
                        .then((response) => {
                            if(!this.terminate) {
                                context.commit('appendAvailableProjects', response.data);
                            }
                        });
                };

                this.import = (project_id, branch) => {
                    ++request_counter;
                    axios({
                        method: 'get',
                        url: GitHelper.makeFileURI(
                            project_id,
                            'dochub.json',
                            branch,
                            'raw'
                        ),
                        headers: { 'Authorization': `Bearer ${context.state.access_token}` }
                    })
                    .then((response) => {
                        if(!this.terminate) {
                            try {
                                if ('imports' in response.data) {
                                    response.data.imports.map((item) => {
                                        this.import(item.project_id, item.branch);
                                    });
                                }
                                if ('docs' in response.data) {
                                    //Make URI of resource
                                    let docs = response.data.docs;
                                    for(let key in docs) {
                                        let doc = docs[key];
                                        doc.id = key;
                                        switch (doc.transport.toUpperCase()) {
                                            case "HTTP":
                                                doc.uri = new URL(doc.source);
                                                break;
                                            default:
                                                doc.uri = GitHelper.makeFileURI(
                                                    doc.project_id,
                                                    doc.source,
                                                    doc.branch,
                                                    'raw'
                                                );
                                                //Get project info
                                                if(!this.projects_tasks[project_id]) {
                                                    this.loadProject(doc.project_id);
                                                }
                                        }
                                    }
                                    context.commit('appendDocs', response.data.docs);
                                }
                            } catch (e) {
                                // eslint-disable-next-line no-console
                                console.error(`'Can not import manifest.`, e);
                            }
                        }
                    })
                    .catch((error) => {
                        // eslint-disable-next-line no-console
                        console.error(error);
                    })
                    .finally(() => {
                        if(--request_counter <= 0) {
                            context.dispatch('updateLastChanges');
                        }
                    });
                }

                this.stop = () => {
                    this.terminate = true;
                }
            };

            if(reload_manifest_request)
                reload_manifest_request.stop();

            request.import(config.root_manifest.project_id, config.root_manifest.branch);

            reload_manifest_request = request;
        }
    }
};

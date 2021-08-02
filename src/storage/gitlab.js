import config from '../../config'
import cookie from 'vue-cookie';
import GitHelper from '../helpers/gitlab'
import parser from '../helpers/manifest_parser';
import Vue from 'vue';

const axios = require('axios');

export default {
    state: {
        // Признак загрузки данных
        is_reloading: false,
        // Токен досутпа в GitLab
        access_token: null,
        // Обобщенный манифест
        manifest: {},
        // Доступные проекты GitLab
        available_projects: {},
        // Струкутар документов
        docsStructure: { nodes: {} },
        // Выбранный документ
        selected_doc: null,
        // Документы
        docs: {},
        // Представления
        presentations: { nodes: {}, components: {} },
        // Архитектурные аспекты
        aspects: {},
        // Поля форм сущностей
        fields: {},
        // Контексты рассмотрения
        contexts: {},
        // Компоненты
        components: {},
        // Проекты
        projects: {},
        // Используемые технологии
        technologies: { sections: {}, items: {} },
        diff_format: 'line-by-line',
        // Последние изменения
        last_changes: {},
    },

    mutations: {
        setManifest(state, value) {
            state.manifest = value;
        },

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
        setAspects(state, value) {
            state.aspects = value;
        },
        setComponents(state, value) {
            state.components = value;
        },
        setPresentations(state, value) {
            state.presentations = value;
        },
        setContexts(state, value) {
            state.contexts = value;
        },
        setFields(state, value) {
            state.fields = value;
        },
        setProjects(state, value) {
            state.projects = value;
        },
        appendAvailableProjects(state, value) {
            Vue.set(state.available_projects, value.id, value);
        },
        setSelectedDocument(state, value) {
            state.selected_doc = value;
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
            parser.onReloaded = (parser) => context.commit('setManifest', parser.manifest);
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
                projects: {},
                aspects: {},
                contexts: {},
                components: {},
                fields: {},
                presentations: { nodes: {}, components: {} },
            };
            parser.import(
                `gitlab:${config.root_manifest.project_id}:${config.root_manifest.branch}@dochub.json`,
                (action, data) => {
                    switch (action) {
                        case 'begin':
                            context.commit('setIsReloading', true);
                            break;
                        case 'project/languages':
                            cache.projects[data.projectID] = cache.projects[data.projectID] || { languages: {} };
                            cache.projects[data.projectID].languages = Object.assign(
                                cache.projects[data.projectID].languages, data.content
                            );
                            break;
                        case 'form': {
                            data.entity && data.fields && data.entity.map((entity) => {
                                cache.fields[entity] = Object.assign(data.fields, cache.fields[entity]);
                            });
                            break;
                        }
                        case 'aspect': {
                            const aspect = cache.aspects[data.id]
                                ? Object.assign(data.content, cache.aspects[data.id])
                                : data.content;
                            !aspect.locations && (aspect.locations = []);
                            data.location && aspect.locations.push(data.location);
                            !aspect.components && (aspect.components = []);
                            data.component && aspect.components.push(data.component);
                            aspect.id = data.id;
                            cache.aspects = Object.assign(cache.aspects, {[data.id]: aspect});
                            break;
                        }
                        case 'component': {
                            const component = cache.components[data.id]
                                ? Object.assign(data.content, cache.components[data.id])
                                : data.content;
                            !component.locations && (component.locations = []);
                            component.locations.push(data.location);
                            component.id = data.id;
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
                            context.commit('setProjects', cache.projects);
                            context.commit('setAspects', cache.aspects);
                            context.commit('setFields', cache.fields);
                            context.commit('setContexts', cache.contexts);
                            context.commit('setPresentations', cache.presentations);
                            context.commit('setComponents', cache.components);
                            context.commit('setIsReloading', false);
                            break;
                    }
                }
            );
        }
    }
};

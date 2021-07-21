const axios = require('axios');
import gitlab from './gitlab';
import config from "../../config";

export default {
    getGitLabProjectID (uri) {
        let result = undefined;
        // Анализируем URI
        try {
            let url = new URL(uri);
            // Если ссылка на gitlab
            if (url.protocol === 'gitlab:') {
                let segments = url.pathname.split('@');
                if (segments.length === 2) {
                    let gilab_params = segments[0].split(':');
                    if (gilab_params.length === 2)
                        result = gilab_params[0];
                }
            }
        } catch (e) {
            return undefined;
        }
        return result;
    },
    makeURIByBaseURI(uri, baseURI) {
        let result;
        // Анализируем URI
        try {
            // Если URI ссылка на прямой ресурс, оставляем его как есть
            new URL(uri);
            result = uri;
        } catch (e) {
            // Если возникла ошибка, считаем путь относительным
            if (!baseURI) {
                throw `Error in base URI ${uri}! Base URI is empty.`
            }
            if ((new URL(baseURI)).protocol === 'gitlab:') {
                const segments = baseURI.split('@');
                if (segments.length !== 2) {
                    // Не указаны идентификатор проекта и бранч GitLab
                    throw `Error in URI ${baseURI}! Not found divider '@'`
                }
                const base = segments[1].split('/');
                if (uri.substring(0, 1) === '/') {
                    result = `${segments[0]}@${uri.substring(1)}`;
                } else {
                    result = `${segments[0]}@${base.slice(0, base.length - 1).join('/')}${base.length > 1 ? '/' : ''}${uri}`;
                }
            } else {
                let slices = baseURI.split('/');
                result = this.makeURL(slices.slice(0, slices.length - 1).join('/') + '/' + uri);
            }
        }
        return result.toString();
    },

    makeURL(uri, baseURI) {
        let result;
        // Анализируем URI
        try {
            let url = new URL(uri);
            // Если ссылка на gitlab
            if (url.protocol === 'gitlab:') {
                let segments = url.pathname.split('@');
                if (segments.length !== 2) {
                    // Не указаны идентификатор проекта и бранч GitLab
                    throw `Error in URI ${uri}! Not found divider '@'`
                } else {
                    let gilab_params = segments[0].split(':');
                    if (gilab_params.length !== 2) {
                        // Неверно указаны идентификатор проекта и бранч GitLab
                        throw `Error in URI ${uri}! Incorrect project id and branch`
                    }

                    result = {
                        type: 'gitlab',
                        projectID: gilab_params[0],
                        url: gitlab.makeFileURI(
                            gilab_params[0], // Application ID
                            segments[1], // Путь к файлу
                            gilab_params[1], // Бранч
                            'raw'
                        )
                    }
                }
                // В ином случае считаем, что ничего делать не нужно
            } else {
                result = {
                    type: 'web',
                    url
                };
            }
        } catch (e) {
            // Если возникла ошибка, считаем путь относительным
            if (!baseURI) {
                throw `Error in base URI ${uri}! Base URI is empty.`
            }
            let slices = baseURI.split('/');
            result = this.makeURL(slices.slice(0, slices.length - 1) + '/' + uri);
        }
        return result;
    },

    request(uri, baseURI, axios_params) {
        let params = Object.assign({}, axios_params);
        params.source = this.makeURL(uri, baseURI);
        params.url = params.source.url.toString();
        if (params.source.url.host === (new URL(config.gitlab_server)).host) {
            if (!params.headers) params.headers = {};
            // eslint-disable-next-line no-undef
            params.headers['Authorization'] = `Bearer ${Vuex.state.access_token}`;
        }
        return axios(params);
    }
};

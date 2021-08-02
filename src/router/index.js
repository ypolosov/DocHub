import Vue from 'vue'
import Router from 'vue-router'
import Swagger from '../components/Swagger'
import Conditions from '../components/Conditions'
import DiffViewer from '../components/DiffViewer'
import Main from '../components/Main'
import config from '../../config'
import consts from '../consts'
import Schema from "../components/Architecture/Schema";
import Component from "../components/Architecture/Component";
import Aspect from "../components/Architecture/Aspect";

import Context from "../components/Architecture/Context";

Vue.use(Router)

let middleware = (route) => {
    // eslint-disable-next-line no-undef
    // Vuex.dispatch('selectDocumentByURI', atob(route.params.source));
    return route.params
}

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            redirect() {
                window.location = new URL(
                    `/oauth/authorize?client_id=${config.oauth.APP_ID}`
                    + `&redirect_uri=` + new URL(consts.pages.OAUTH_CALLBACK_PAGE, window.location)
                    + `&response_type=token&state=none&scope=${config.oauth.REQUESTED_SCOPES}`
                    + '&' + Math.floor(Math.random() * 10000)
                    , config.gitlab_server
                );
            }
        },
        {
            path: '/sso/gitlab/authentication',
            redirect: "/main"
        },
        {
            name: 'main',
            path: '/main',
            component: Main,
        },
        {
            name: 'swagger',
            path: '/swagger/:source',
            component: Swagger,
            props: middleware
        },
        {
            name: 'conditions',
            path: '/diff/:source/:target',
            component: Conditions,
            props: middleware
        },
        {
            name: 'diff',
            path: '/diff/:source/:target/:mode',
            component: DiffViewer,
            props: middleware
        },
        {
            name: 'schema',
            query:{
                name:'focus'
            },
            path: '/schema/:context',
            component: Schema,
            props: middleware
        },
        {
            name: 'component',
            path: '/schema/:context/components/:component',
            component: Component,
            props: middleware
        },
        {
            name: 'aspect',
            path: '/schema/:context/components/:component/aspect/:aspect',
            component: Aspect,
            props: middleware
        },
        {
            name: 'aspect',
            path: '/architect/contexts/*',
            component: Context,
            props: middleware
        },
    ]
})

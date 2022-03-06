import Vue from 'vue'
import Router from 'vue-router'
import Doc from "../components/Docs/DocHubDoc";
import Conditions from '../components/Conditions'
import DiffViewer from '../components/DiffViewer'
import Main from '../components/Main'
import config from '../../config'
import consts from '../consts'
import Component from "../components/Architecture/Component";
import Aspect from "../components/Architecture/Aspect";
import Context from "../components/Architecture/Context";
import Radar from "../components/Techradar/Main";
import Technology from "../components/Techradar/Technology";
import Problems from "../components/Problems/Problems";
import ComponentsMindmap from "../components/Mindmap/ComponentsMindmap";
import AspectsMindmap from "../components/Mindmap/AspectsMindmap";

Vue.use(Router)

let middleware = (route) => {
    // eslint-disable-next-line no-undef
    // Vuex.dispatch('selectDocumentByURI', atob(route.params.source));
    return route.params
}

const rConfig = {
    routes: [
        {
            name: 'main',
            path: '/main',
            component: Main,
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
            name: 'doc',
            path: '/docs/:document',
            component: Doc,
            props: middleware
        },
        {
            name: 'architect',
            path: '/architect',
            component: ComponentsMindmap,
            props: middleware
        },
        {
            name: 'aspects',
            path: '/aspects',
            component: AspectsMindmap,
            props: middleware
        },
        {
            name: 'contexts',
            path: '/architect/contexts/:context',
            component: Context,
            props: middleware
        },
        {
            name: 'component',
            path: '/architect/components/:component',
            component: Component,
            props: middleware
        },
        {
            name: 'aspect',
            path: '/architect/aspects/:aspect',
            component: Aspect,
            props: middleware
        },
        {
            name: 'radar',
            path: '/techradar',
            component: Radar,
            props: middleware
        },
        {
            name: 'radar-section',
            path: '/techradar/:section',
            component: Radar,
            props: middleware
        },
        {
            name: 'technology',
            path: '/technology/:technology',
            component: Technology,
            props: middleware
        },
        {
            name: 'problems',
            path: '/problems',
            component: Problems,
            props: middleware
        },
    ]
};

if (process.env.VUE_APP_DOCHUB_MODE !== "plugin") {
    rConfig.mode = 'history';
    rConfig.routes.push(
        {
            path: '/',
            redirect() {
                if (config.oauth !== false) {
                    window.location = new URL(
                        `/oauth/authorize?client_id=${config.oauth.APP_ID}`
                        + `&redirect_uri=` + new URL(consts.pages.OAUTH_CALLBACK_PAGE, window.location)
                        + `&response_type=token&state=none&scope=${config.oauth.REQUESTED_SCOPES}`
                        + '&' + Math.floor(Math.random() * 10000)
                        , config.gitlab_server
                    );
                } else {
                    window.location = new URL('/main', window.origin)
                }
        }
    });
    rConfig.routes.push(        
        {
            path: '/sso/gitlab/authentication',
            redirect(route) {
                const accessToken = Object.keys(route.query).length
                    ? route.query.access_token
                    : new URLSearchParams(route.hash.substr(1)).get('access_token');
                if (accessToken) {
                    window.Vuex.dispatch('onReceivedOAuthToken', accessToken);
                    return {
                        path: '/main',
                        query: {},
                        hash: ''
                    };
                } else {
                    return {
                        path: '/sso/error',
                        query: {},
                        hash: ''
                    };
                }
            }
        }
    );
}

export default new Router(rConfig);

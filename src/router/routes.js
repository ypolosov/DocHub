import Doc from '../components/Docs/DocHubDoc';
import Main from '../components/Main';
import config from '../../config';
import consts from '../consts';
import Component from '../components/Architecture/Component';
import Aspect from '../components/Architecture/Aspect';
import Context from '../components/Architecture/Context';
import Radar from '../components/Techradar/Main';
import Technology from '../components/Techradar/Technology';
import Problems from '../components/Problems/Problems';
import ComponentsMindmap from '../components/Mindmap/ComponentsMindmap';
import AspectsMindmap from '../components/Mindmap/AspectsMindmap';
import Empty from '../components/Controls/Empty';
import DevTool from '../components/JSONata/DevTool';
import Entity from '../components/Entities/Entity';

const middleware = (route) => {
	if (config.oauth !== false && !window.Vuex.state.isOAuthProcess && !window.Vuex.state.access_token) {
		window.location = new URL(
			`/oauth/authorize?client_id=${config.oauth.APP_ID}`
            + '&redirect_uri=' + new URL(consts.pages.OAUTH_CALLBACK_PAGE, window.location)
            + `&response_type=code&state=none&scope=${config.oauth.REQUESTED_SCOPES}`
            + '&' + Math.floor(Math.random() * 10000)
			, config.gitlab_server
		);
	}

	return route.params;
};

const routes = [
  {
    name: 'main',
    path: '/main',
    component: Main,
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
    path: '/problems/:subject',
    component: Problems,
    props: middleware
  },
  {
    name: 'problems',
    path: '/problems',
    component: Problems,
    props: middleware
  },
  {
    name: 'devtool',
    path: '/devtool',
    component: DevTool,
    props: middleware
  },
  {
    name: 'entities',
    path: '/entities/:entity/:presentation',
    component: Entity,
    props: middleware
  },
  {
    name: 'Empty',
    path: '*',
    component: Empty
  }
];

export default routes;

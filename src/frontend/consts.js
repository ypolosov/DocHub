export default {
	plugin: {
		ROOT_MANIFEST: 'plugin:/idea/source/$root'
	},
	pages: {
		OAUTH_CALLBACK_PAGE: '/sso/gitlab/authentication',
		MAIN_PAGE: '/main'
	},
	plantuml: {
		DEFAULT_SERVER: 'seaf.slsdev.ru/seafplantuml/svg/' // 'www.plantuml.com/plantuml/svg/'
	},
	transports: {
		HTTP: 'http',
		GITLAB: 'gitlab'
	},
	events: {
		CHANGED_SOURCE: 'on-changed-source'
	}
};


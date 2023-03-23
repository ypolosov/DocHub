import consts from '@front/consts';
import env from '@front/helpers/env';
import {Plugins} from '@front/helpers/env';

// eslint-disable-next-line no-console
console.info('ENVIRONMENTS:');

const hiddenEnvs = ['VUE_APP_DOCHUB_CLIENT_SECRET'];

for(const key in env.dochub.processEnv) {
	// eslint-disable-next-line no-console
	console.info(`  ${key}=`, hiddenEnvs.indexOf(key) < 0 ? JSON.stringify(env.dochub[key]) : '**HIDDEN**');
}

const config: any = {};

if(!env.dochub.VUE_APP_DOCHUB_GITLAB_URL) {
	// eslint-disable-next-line no-console
	console.warn('Not specified the URL of the GitLab (VUE_APP_DOCHUB_GITLAB_URL)');
	config.oauth = false;
} else {
	config.gitlab_server = env.dochub.VUE_APP_DOCHUB_GITLAB_URL;

	if (env.dochub.VUE_APP_DOCHUB_PERSONAL_TOKEN) {
		// Персональный токен генерируемый пользователем
		config.porsonalToken = env.dochub.VUE_APP_DOCHUB_PERSONAL_TOKEN;
		config.oauth = false;
	} else {
		// Секреты приложения для OAuth авторизации в GitLab
		if(!env.dochub.VUE_APP_DOCHUB_CLIENT_SECRET)
			throw 'Not specified the application secret at GitLab (VUE_APP_DOCHUB_CLIENT_SECRET)';

		if(!env.dochub.VUE_APP_DOCHUB_APP_ID)
			throw 'Not specified the application ID at GitLab (VUE_APP_DOCHUB_APP_ID)';

		config.oauth = {
			'APP_ID': env.dochub.VUE_APP_DOCHUB_APP_ID,
			'CLIENT_SECRET': env.dochub.VUE_APP_DOCHUB_CLIENT_SECRET,
			'REQUESTED_SCOPES': 'read_repository+api'
		};
	}
}


config.root_manifest = env.dochub.VUE_APP_DOCHUB_ROOT_MANIFEST || 'example/root.yaml';

if (env.isPlugin(Plugins.idea)) {
	if (!env.isProduction()) {
		window.$PAPI = require('@idea/apimoc').default;
	} else  {
		config.root_manifest = consts.plugin.ROOT_MANIFEST;
	}
}

config.pumlServer =
	window.$PAPI?.settings?.render?.server
	|| env.dochub.VUE_APP_PLANTUML_SERVER
	|| 'www.plantuml.com/plantuml/svg/';

config.pumlRequestType =
  window.$PAPI?.settings?.render?.request_type
  || 'get';

export default config;

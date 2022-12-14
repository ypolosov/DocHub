import config from '../../package.json';
import manager from './manager';

for(const id in config.plugins || {}) {
	const module = config.plugins[id];
	import(`../../plugins/${module}`).then((plugin) => {
		plugin.default(manager.registrar);
	});
}

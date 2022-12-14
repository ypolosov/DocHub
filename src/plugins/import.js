import config from '../../package.json';
import manager from './manager';

for(const id in config.plugins || {}) {
	// const module = `../../${config.plugins[id]}`;
	//const module = '../../plugins/html/html';
	//const module = 'html/html';
	const module = config.plugins[id];
	// eslint-disable-next-line no-debugger
	debugger;
	import(`../../plugins/${module}`).then((plugin) => {
		plugin.default(manager.registrar);
	});
}

import requests from './requests';
import env, {Plugins} from './env';
import routes from '../router/routes';

function isLocalRoute(url) {
	const urlRoot = url.pathname.split('/')[1];
	for (let i = 0; i < routes.length; i++) {
		const route = routes[i].path.split('/')[1];
		if (urlRoot === route) return true;
	}
	return false;
}

// Работа с ссылками
export default {
	// Обрабатывает клик по ссылке
	onClickRef(event) {
		event.preventDefault();
		if (event.shiftKey) return false;
		const ref = event.currentTarget.href.baseVal || event.currentTarget.href;
		if (!ref.length) return false;
		try {
			if (requests.isExternalURI(ref)) {
				window.open(ref, 'blank_');
			} else {
				const url = new URL(ref, window.location);
				if (isLocalRoute(url)) 
					window.Router.push({ path: url.pathname, query: Object.fromEntries(url.searchParams)});
				else
					window.open(ref, 'blank_');
			}
		} catch (e) {
			if (env.isPlugin(Plugins.idea)) {
				window.Router.push({ path: ref.split('#')[1]});
			}
		}

		return false;
	},

	// Обрабатывает элемент для сормирование корректных ссылок в нем
	elProcessing(el) {
		const refs = el.querySelectorAll('[href]');
		for (let i = 0; i < refs.length; i++) {
			refs[i].onclick = this.onClickRef;
		}
	}
};

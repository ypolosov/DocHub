import gitlabDriver from '../../gitlab/driver.mjs';

export default function(config) {
	const gitlab = new gitlabDriver(config);
	this.isURL= (url) => {
		// eslint-disable-next-line no-useless-escape
		return url && url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.?[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/);
	};
	this.isExternalURI = (uri) => {
		return (uri.slice(0, window.origin.length) !== window.origin) && this.isURL(uri);
	};
	this.makeURIByBaseURI = (uri, baseURI) => {
		let result;
		// Анализируем URI
		try {
			// Если URI ссылка на прямой ресурс, оставляем его как есть
			new URL(uri);
			result = uri;
		} catch (e) {
			// Если возникла ошибка, считаем путь относительным
			if (!baseURI) {
				throw `Error in base URI ${uri}! Base URI is empty.`;
			}

			if ((new URL(baseURI)).protocol === 'gitlab:') {
				const segments = baseURI.split('@');
				if (segments.length !== 2) {
					// Не указаны идентификатор проекта и бранч GitLab
					throw `Error in URI ${baseURI}! Not found divider '@'`;
				}
				const base = segments[1].split('/');
				if (uri.substring(0, 1) === '/') {
					result = `${segments[0]}@${uri.substring(1)}`;
				} else {
					result = `${segments[0]}@${base.slice(0, base.length - 1).join('/')}${base.length > 1 ? '/' : ''}${uri}`;
				}
			} else {
				const slices = baseURI.split('/');
				result = this.makeURL(slices.slice(0, slices.length - 1).join('/') + '/' + uri).url;
			}
		}
		return result.toString();
	};
	this.makeURL = (uri, baseURI) => {
		let result;
		// Анализируем URI
		try {
			let url = new URL(uri);
			// Если ссылка на gitlab
			if (url.protocol === 'gitlab:') {
				let segments = url.pathname.split('@');
				if (segments.length !== 2) {
					// Не указаны идентификатор проекта и бранч GitLab
					throw `Error in URI ${uri}! Not found divider '@'`;
				} else {
					let gilab_params = segments[0].split(':');
					if (gilab_params.length !== 2) {
						// Неверно указаны идентификатор проекта и бранч GitLab
						throw `Error in URI ${uri}! Incorrect project id and branch`;
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
					};
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
				throw `Error in base URI ${uri}! Base URI is empty.`;
			}
			result = this.makeURL(baseURI);
			if (result.type === 'gitlab') {
				let slices = result.url.toString().split('/');
				const path = (new URL(uri, 'path:/' + slices[slices.length - 2].split('%2F').join('/'))).toString();
				slices[slices.length - 2] = (path.split('path:/')[1] || '').split('/').join('%2F');
				/*
				const subSlices = slices[slices.length - 2].split('%2F');
				subSlices[subSlices.length - 1] = uri.replace(/\//g, '%2F');
				slices[slices.length - 2] = subSlices.join('%2F');
				*/
				result.url = new URL(slices.join('/'));
			} else {
				result.url = new URL(uri, result.url);
			}
		}
		return result;
	};
}


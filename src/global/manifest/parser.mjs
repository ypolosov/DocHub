import cache from './services/cache.mjs';
import prototype from './prototype.mjs';

// Определяет глубину лога источника для секции
const sectionDeepLog = {
	'forms': 0,
	'namespaces': 0,
	'imports': 0,
	'aspects': 2,
	'docs': 2,
	'contexts': 2,
	'components': 2,
	'entities': 6,
	'rules': 3,
	'datasets': 2,
	'$default$': 2
};

const parser = {
	// Манифест перезагружен
	onReloaded: null,
	// Запущена перезагрузка манифеста
	onStartReload: null,
	// События по ошибкам (ошибки запросов)
	onError: null,
    // Возвращает базовый, предопределенный манифест
    getBaseManifest: null,
    // Сервис управления кэшем
    cache,
	async startLoad() {
		this.onStartReload && this.onStartReload(this);
	},
	stopLoad() {
		this.expandPrototype();
		this.onReloaded && this.onReloaded(this);
	},
	// Журнал объединений
	mergeMap: {},
	// Итоговый манифест
	manifest: null,
	// Возвращает тип значения
	fieldValueType(value) {
		const type = typeof value;
		if (type === 'string') {
			// В значении JSONata запрос
			if (/(\s+|)\(((.*|\d|\D)+?)(\)(\s+|))$/.test(value))
				return 'jsonata';
			else {
				const ext = value.split('.').pop();
				// В значении ссылка на файл
				if (['yaml', 'json', 'jsonata'].indexOf(ext) >= 0)
					return 'ref';
				else
					// В значении ссылка на файл
					return 'id';
			}
		} else
			return type;
	},
	// Реализует наследование
	expandPrototype() {
		prototype.expandAll(this.manifest);
	},
	// Преобразование относительных ссылок в прямые
	propResolver: {
		docs(item, baseURI) {
			['source', 'origin', 'data'].forEach((field) =>
				item[field]
				&& (parser.fieldValueType(item[field]) === 'ref')
				&& (item[field] = parser.cache.makeURIByBaseURI(item[field], baseURI))
			);
		},
		datasets(item, baseURI) {
			this.docs(item, baseURI);
		}
	},
	//Регистрирует ошибку
	// e - объект ошибки
	// uri - источник ошибки
	registerError(e, uri) {
		const errorPath = `$errors/requests/${new Date().getTime()}`;
		this.pushToMergeMap(errorPath, null, uri);
		// eslint-disable-next-line no-console
		console.error(e, `Ошибка запроса [${errorPath}:${uri}]`, e);
		let errorType = (() => {
			switch (e.name) {
				case 'YAMLSyntaxError':
				case 'YAMLSemanticError':
					return 'syntax';
				default:
					return 'net';
			}
		})();

		this.onError && this.onError(errorType, {
			uri,
			error: e
		});
	},
	// Сохраняет в карте склеивания данные
	pushToMergeMap(path, source, location) {
		const structPath = (path || '').split('/');
		if (structPath.length - 1 > sectionDeepLog[structPath[1] || '$default$']) return;
		const storePath = path || '/';

		!this.mergeMap[storePath] && (this.mergeMap[storePath] = []);

		!this.mergeMap[storePath][location] && (this.mergeMap[storePath].push(location));

		if (typeof source === 'object') {
			for (const key in source) {
				this.pushToMergeMap(`${path || ''}/${key}`, source[key], location);
			}
		}
	},
	// Склеивание манифестов
	// destination - Объект с которым происходит объединение. Низкий приоритете.
	// source - Объект с которым происходит объединение. Высокий приоритете.
	// location - Размещение объекта source (источник изменений)
	// path - Путь к объекту
	merge(destination, source, location, path) {
		let result;
		if (destination === undefined) {
			result = source;
			this.pushToMergeMap(path, result, location);
		} else if (Array.isArray(source)) {
			if (Array.isArray(destination)) {
				result = destination.reduce((acc, currEl) =>
					Array.isArray(acc) && (typeof acc[0] === 'object')
						? source
						: acc.filter(deepEl => deepEl !== currEl).concat(currEl),
					source
				);
			} else {
				result = source;
			}
			this.pushToMergeMap(path, result, location);
		} else if (typeof source === 'object') {
			result = destination;
			typeof result !== 'object' && (result = {});
			const pathStruct = path ? path.split('/') : [];
			const entity = pathStruct.pop();
			for (const id in source) {
				const keyPath = `${path || ''}/${id}`;
				if (result[id]) {
					result[id] = this.merge(result[id], source[id], location, `${path || ''}/${id}`);
				} else {
					result[id] = source[id];
					this.pushToMergeMap(keyPath, result[id], location);
				}
				pathStruct.length == 1 && this.propResolver[entity] && this.propResolver[entity](result[id], location);
			}
		} else {
			result = source;
			this.pushToMergeMap(path, result, location);
		}
		return result;
	},

	// Возвращает контекст свойства по заданному пути
	// path - пусть к свойству
	getManifestContext(path) {
		let node = this.manifest;
		const keys = path.split('/');
		for (let i = 0; i < keys.length - 1; i++) {
			const key = decodeURIComponent(keys[i]);
			node = node[key] || (node[key] = {});
		}
		const property = decodeURIComponent(keys.pop());
		return {
			node,
			property,
			data: node[property]
		};
	},

	// Декомпозирует свойство манифеста
	// Если свойство содержит ссылку, загружает объект
	// data - Значение свойства
	// path - путь к свойству от корня манифеста
	async expandProperty(data, path, baseURI) {
		// const data = this.getManifestContext(path).data;
		// Если значение является ссылкой, загружает объект по ссылке
		if (typeof data === 'string') {
			const URI = parser.cache.makeURIByBaseURI(data, baseURI);

			try {
				const response = await parser.cache.request(URI, path);
				if (response) {
					const context = this.getManifestContext(path);
					context.node[context.property] = this.merge(context.node[context.property], response.data, URI, path);
				}
			} catch (e) {
				this.registerError(e, URI);
			}
		}
	},
	// Разбираем сущности
	// path - путь к перечислению сущностей (ключ -> объект)
	async parseEntity(context, path, baseURI) {
		for (const key in context) {
			await this.expandProperty(context[key], `${path}/${encodeURIComponent(key)}`, baseURI);
		}
	},

	// Создает базовый манифест
	makeBaseManifest() {
        return (this.getBaseManifest && this.getBaseManifest()) || {};
		// По умолчанию подключаем контроль ядра метамодели
	},

	// Подключение манифеста
	async import(uri, subimport) {
		if (!subimport) {
            this.mergeMap = {};
            this.manifest = this.merge({}, this.makeBaseManifest(), uri);
			this.onStartReload && this.onStartReload(this);
		}

		try {
			const response = await parser.cache.request(uri, '/');
			const manifest = response && (typeof response.data === 'object'
				? response.data
				: JSON.parse(response.data));

			if (manifest) {
				// Определяем режим манифеста
				// eslint-disable-next-line no-unused-vars
                this.manifest = this.merge(this.manifest, manifest, uri);

				for (const section in manifest) {
					const node = manifest[section];
					switch (section) {
						case 'forms':
						case 'namespaces':
						case 'aspects':
						case 'docs':
						case 'contexts':
						case 'components':
						case 'rules':
						case 'datasets':
							await this.parseEntity(node, `/${section}`, uri);
							break;
						case 'imports':
							for (const key in node) {
								await this.import(parser.cache.makeURIByBaseURI(node[key], uri), true);
							}
							break;
					}
				}
			}
		} catch (e) {
			this.registerError(e, uri);
		} finally {
			!subimport && this.stopLoad();
		}
	}
};

export default parser;

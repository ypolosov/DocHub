import requests from '../helpers/requests';
import gitlab from '../helpers/gitlab';
import property from './prototype';
import env from '../helpers/env';
import { MANIFEST_MODES } from '@/manifest/enums/manifest-modes.enum';
import {manifestCache} from '@/helpers/cache';

let touchProjects = {};

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
  cacheIsLoaded: false,
	async startLoad() {
    this.onStartReload(this);

    if (this.isCaching()) {
      const cachedManifest = await manifestCache.get();

      if (cachedManifest) {
        this.manifest = cachedManifest.original;
        this.mergeMap = cachedManifest.merged;
        this.cacheIsLoaded = true;
      }
    }
  },
	stopLoad() {
    this.expandPrototype();
    this.onReloaded(this);

    if(this.isCaching()) {
      manifestCache.set({
        original: this.manifest,
        merged: this.mergeMap
      });
    }
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
		property.expandAll(this.manifest[this.manifest.mode || MANIFEST_MODES.AS_IS]);
	},
	// Преобразование относительных ссылок в прямые
	propResolver: {
		docs(item, baseURI) {
			['source', 'origin', 'data'].forEach((field) =>
				item[field]
                && (parser.fieldValueType(item[field]) === 'ref')
                && (item[field] = requests.makeURIByBaseURI(item[field], baseURI))
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
		/*
		const found = this.mergeMap.find((element) => {
			return ((element.path === storePath) && (element.location === location));
		});
		if (!found) {
			this.mergeMap.push({
				path: path || '/',
				location
			});
			if (typeof source === 'object') {
				for (const key in source) {
					this.pushToMergeMap(`${path || ''}/${key}`, source[key], location);
				}
			}
		}
		*/
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
				result = [...new Set(destination.concat(source))];
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
	// path - пусть к свойству от корня манифеста
	async expandProperty(data, path, baseURI) {
		// const data = this.getManifestContext(path).data;
		// Если значение является ссылкой, загружает объект по ссылке
		if (typeof data === 'string') {
			const URI = requests.makeURIByBaseURI(data, baseURI);

      try {
        const response = await requests.request(URI);

        if (!this.isCaching(response)) {
          const context = this.getManifestContext(path);
          context.node[context.property] = this.merge(context.node[context.property], response.data, URI, path);
        }

        await this.touchProjects(URI);
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

	// Детектит обращение к проектам
	async touchProjects(location, callback) {
		const projectID = requests.getGitLabProjectID(location);
		let URI;
		if (projectID && !touchProjects[projectID]) {
			touchProjects[projectID] = {};
			URI = gitlab.projectLanguagesURI(projectID);

      try {
        const response = await requests.request(URI);

        if (!this.isCaching(response)) {
          callback('project/languages', {
            projectID: projectID,
            content: typeof response.data === 'string'
              ? JSON.parse(response.data)
              : response.data
          });
        }
      } catch (e) {
        this.registerError(e, URI);
      }
		}
	},

	// Создает базовый манифест
	makeBaseManifest() {
		// По умолчанию подключаем контроль ядра метамодели
		if ((process.env.VUE_APP_DOCHUB_APPEND_DOCHUB_METAMODEL || 'y').toLowerCase() === 'y' ) {
			const YAML = require('yaml');
			const baseYAML = require('!!raw-loader!../assets/base.yaml').default;
			return YAML.parse(baseYAML);
		} else return {};
	},

	// Подключение манифеста
	async import(uri, subimport) {
		if (!subimport) {
      if (!this.cacheIsLoaded) {
        this.mergeMap = {};
        this.manifest = { [ MANIFEST_MODES.AS_IS ] : this.merge({}, this.makeBaseManifest(), uri)};
      }
			touchProjects = {};
			// Подключаем манифест самого DocHub
			// eslint-disable-next-line no-constant-condition
			if (
				(!env.isPlugin()) &&
				((process.env.VUE_APP_DOCHUB_APPEND_DOCHUB_DOCS || 'y').toLowerCase() === 'y')
			) {
				await this.import(
          requests.makeURIByBaseURI('documentation/root.yaml', requests.getSourceRoot()),
          true
        );
			}
		}

		await this.touchProjects(uri, () => false);

    try {
      const response = await requests.request(uri);
      const manifest = typeof response.data === 'object'
        ? response.data
        : JSON.parse(response.data);

      if (manifest) {
        // Определяем режим манифеста
        // eslint-disable-next-line no-unused-vars
        const mode = manifest.mode || MANIFEST_MODES.AS_IS;

        if (!this.isCaching(response)) {
          this.manifest[mode] = this.merge(this.manifest[mode], manifest, uri);
        }

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
            await this.parseEntity(node,`${mode}/${section}`, uri);
            break;
          case 'imports':
            for (const key in node) {
              await this.import(requests.makeURIByBaseURI(node[key], uri), true);
            }
            break;
          }
        }
      }
    } catch (e) {
      this.registerError(e, uri);
    }
	},

  isCaching: env.cache && !env.isPlugin()
    ? (response) => response
      ? response.status === 304
      : true
    : () => false
};

export default parser;

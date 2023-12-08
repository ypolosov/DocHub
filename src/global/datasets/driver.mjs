import source from "./source.mjs";

export default {
	// Метод получения объекта данных по пути в структуре
	// Путь имеет вид "/foo/foo/0/foo"
	// Возвращает структуру:
	//	{
	//		context - данные, по которым необходимо выполнять запросы
	//		subject - объект данных
	//		baseURI	- URI расположения исходников кода для разрешения относительных путей
	//  }
	// eslint-disable-next-line no-unused-vars
	pathResolver(path) {
		throw 'pathResolver is not released for backend yet :(';
	},

	// Драйвер доступа к данным через JSONata
	// Должен быть реализован
	jsonataDriver: {
		expression() {
			throw 'jsonataDriver is not implemented in the dataset module :(';
		}
	},
	// Драйвер запросов
	// eslint-disable-next-line no-unused-vars
	request(url, baseURI) {
		throw 'request driver is not implemented in the dataset module :(';
	},
	// Парсит поле данных в любом объекте
	//  context 	- Контекст данных для выполнения запросов
	//  data 		- данные требующие парсинга (запрос / структура / идентификатор dataset)
	//	subject 	- объект - владелец
	//  params 		- параметры передающиеся в запрос
	//  baseURI		- URI от которого будут строиться относительные пути
	parseSource(context, data, subject, params, baseURI) {
		return new Promise((resolve, reject) => {
			const sourceType = source.type(data);
			switch(sourceType) {
				case 'data-object':
					resolve(JSON.parse(JSON.stringify(data)));
					break;
				case 'jsonata-query': {
					const exp = this.jsonataDriver.expression(data, subject, params);
					exp.onError = reject;
					exp.evaluate(context)
						.then((result) => resolve(result))
						.catch(reject);
				} break;
				case 'jsonata-file': {
					this.request(data, baseURI).then((response) => {
						const query = typeof response.data === 'string'
							? response.data
							: JSON.stringify(response.data);
						const exp = this.jsonataDriver.expression(`(${query})`, params);
						exp.onError = reject;
						exp.evaluate(context)
							.then((result) => resolve(result))
							.catch(reject);
					}).catch(reject);
				} break;
				case 'data-file': {
					this.request(data, baseURI)
					.then((response) => {
						this.parseSource(context, response.data)
							.then((result) => resolve(result))
							.catch((e) => reject(e));
					}).catch(reject);
				} break;
				case 'resource': {
					reject(`Тип данных 'resource' не реализован  [${data}]`);
				} break;
				case 'resource-inline':
					resolve(JSON.parse(decodeURIComponent(data.slice(7))));
					break;
				case 'id': {
					const dataSet = this.pathResolver(`/datasets/${data}`);
					if (dataSet && dataSet.subject) {
						this.getData(context, dataSet.subject, params, dataSet.baseURI)
							.then((data) => resolve(data))
							.catch(reject);
					} else reject(`Не найден источник данных [${data}]`);
				} break;
				default:
					reject(`Ошибка источника данных [${sourceType}: ${data}]`);
			}
			
			/*
			// Константные данные
			if (typeof data === 'object') {
				resolve(JSON.parse(JSON.stringify(data)));
			} else if (typeof data === 'string') {
				// Inline запрос JSONata
				if (/^(\s+|)\(((.*|\d|\D)+?)(\)(\s+|))$/.test(data)) {
					const exp = this.jsonataDriver.expression(data, subject, params);
					exp.onError = reject;
					exp.evaluate(context)
						.then((result) => resolve(result))
						.catch(reject);
					// Ссылка на файл с данными
				} else if (data.slice(-8) === '.jsonata') {
					this.request(data, baseURI).then((response) => {
						const exp = this.jsonataDriver.expression(typeof response.data === 'string'
							? response.data
							: JSON.stringify(response.data), params);
						exp.onError = reject;
						exp.evaluate(context)
							.then((result) => resolve(result))
							.catch(reject);
					}).catch(reject);
					// Идентификатор источника данных
				} else if (data.slice(-5) === '.yaml' || data.slice(-5) === '.json' || (data.search(':') > 0)) {
					this.request(data, baseURI)
						.then((response) => {
							this.parseSource(context, response.data)
								.then((result) => resolve(result))
								.catch((e) => reject(e));
						}).catch(reject);
					// Ссылка на файл с запросом
				} else {
					const dataSet = this.pathResolver(`/datasets/${data}`);
					if (dataSet && dataSet.subject) {
						this.getData(context, dataSet.subject, params, dataSet.baseURI)
							.then((data) => resolve(data))
							.catch(reject);
					} else reject(`Не найден источник данных [${data}]`);
				}
			} else reject(`Ошибка источника данных [${data}]`);
			*/
		});
	},

	// Возвращает данные по субъекту
	//  context - данные для запроса
	//  subject - субъект данных
	//  params 	- параметры передающиеся в запрос
	//  baseURI	- URI от которого будут строиться относительные пути
	getData(context, subject, params, baseURI) {
		return new Promise((resolve, reject) => {
			const exec = (origin) => {
				this.parseSource(origin, subject.source || (subject.data /* depricated */), subject, params, baseURI)
					.then((data) => resolve(data))
					.catch((e) => reject(e));
			};
			if (subject.source || (subject.data /* depricated */)) {
				if (subject.origin) {
					if (typeof subject.origin === 'string') {
						this.parseSource(context, subject.origin, subject, params, baseURI)
							.then((data) => exec(data))
							.catch((e) => reject(e));
					} else if ((typeof subject.origin === 'object') && !Array.isArray(subject.origin)) {
						let counter = 0;
						const data = {};
						for (const key in subject.origin) {
							++counter;
							this.parseSource(context, subject.origin[key], subject, params, baseURI).then((content) => {
								data[key] = content;
								if (!--counter) exec(data);
							}).catch((e) => reject(e));
						}
					} else reject(`Ошибка данных [${subject.source}]`);
				} else exec(context);
			} else resolve(null); // Нет данных
		});
	},

	// [path] = {
	//		origin - Необязательно. Ссылка на оригинальный DataSet / JSONata запрос / Ссылка на файл данных / константная структура
	//		source - идентификатор DataSet / JSONata запрос / Ссылка на файл данных / константная структура
	// }
	// Сам объект передается в запрос в переменной $self
	// $self._id автоматически генерируемое поле содержащее последний сегмент path
	async releaseData(path, params) {
		const meta = await this.pathResolver(path);
		if (!meta) throw `Error of access to object via path [${path}]`;

		const subject = Object.assign({_id: path.split('/').pop()}, meta.subject || {});
		const baseURI = meta.baseURI || '/';

		return await this.getData(meta.context, subject, params, baseURI);
	}
};


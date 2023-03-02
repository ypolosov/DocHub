export default {
	// Метод получения объекта данных 
	// Должен быть реализован
	// eslint-disable-next-line no-unused-vars
	dsResolver(datasetID) {
		throw 'dsResolver is not implemented in the dataset module :(';
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
			// Константные данные
			if (typeof data === 'object') {
				resolve(JSON.parse(JSON.stringify(data)));
			} else if (typeof data === 'string') {
				// Inline запрос JSONata
				if (/^(\s+|)\(((.*|\d|\D)+?)(\)(\s+|))$/.test(data)) {
					const exp = this.jsonataDriver.expression(data, subject, params);
					exp.onError = reject;
					exp.evaluate(context)
						.then((data) => resolve(data))
						.catch(reject);
					// Ссылка на файл с данными
				} else if (data.slice(-8) === '.jsonata') {
					this.request(data, baseURI).then((response) => {
						const exp = this.jsonataDriver.expression(typeof response.data === 'string'
							? response.data
							: JSON.stringify(response.data), params);
						exp.onError = reject;
						exp.evaluate(context)
							.then((data) => resolve(data))
							.catch(reject);
					}).catch(reject);
					// Идентификатор источника данных
				} else if (data.slice(-5) === '.yaml' || data.slice(-5) === '.json' || (data.search(':') > 0)) {
					this.request(data, baseURI)
						.then((response) => {
							this.parseSource(context, response.data)
								.then((data) => resolve(data))
								.catch((e) => reject(e));
						}).catch(reject);
					// Ссылка на файл с запросом
				} else {
					const dataSet = this.dsResolver(data);
					if (dataSet && dataSet.subject) {
						this.getData(context, dataSet.subject, params, dataSet.baseURI)
							.then((data) => resolve(data))
							.catch(reject);
					} else reject(`Не найден источник данных [${data}]`);
				}
			} else reject(`Ошибка источника данных [${data}]`);
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
	}
};


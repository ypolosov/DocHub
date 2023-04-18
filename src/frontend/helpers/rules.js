import validators from '@global/rules/validators.mjs';
import datasets from './datasets';
import env from './env';
import requests from './requests';

// Выполняет валидаторы и накладывает исключения
export default function(manifest, success, reject) {
	if (env.isBackendMode()) {
		requests.request('backend://problems/')
			.then((response) => {
				(response.data || []).map((item) => success(item));
			})
			.catch((error) => {
				reject(
					{
						id: '$system',
						title: 'Системные ошибки',
						error,
						items: [
							{
								uid: '$net',
								title: 'Не могу получить данные!',
								correction: 'Проверьте сетевое подключение и повторите попытку позже.',
								description: error.message
							}
						]
					}
				);
			});
	} else return validators(datasets(), manifest, success, reject);
}

// Выполняет валидаторы и накладывает исключения
export default function(datasets, manifest, success, reject) {
	const validators = (manifest['rules'] || {})['validators'] || {};

	for (const id in validators) {
		datasets.getData(manifest, Object.assign({_id: id}, validators[id]))
			.then((items) => {
				success({
					id,
					title: validators[id].title || id,
					items
				});
			}).catch((error) => {
				reject(
					{
						id,
						title: validators[id].title || id,
						error,
						items: [
							{
								uid: id,
								title: 'Критическая ошибка валидатора!',
								correction: 'Исправьте ошибку в запросе валидатора',
								description: error.message
							}
						]
					}
				);
			});
	}
}

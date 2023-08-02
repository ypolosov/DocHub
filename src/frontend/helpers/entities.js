// Обрабатывает кастомные сущности
import query from '@front/manifest/query';
import crc16 from '@global/helpers/crc16';
import env, {Plugins} from '@front/helpers/env';

let appliedSchemaCRC = null;

// Генерируем схемы 
function makeSubjectsRelationsSchema(manifest) {
	const rels = {};
	for (const entityId in manifest.entities || {}) {
		const objects = manifest.entities[entityId].objects;
		// Если сущность не публикует субъекты, то игнорируем ее
		if (!objects) continue;
		// Генерируем схемы связей с объектами
		for (const subjectId in objects) {
			const route = (objects[subjectId].route || '/').split('/');
			let location = manifest[entityId] || {};
			for (let i = 1; i < route.length; i++) {
				location?.length && (location = location[route[i]] || {});
			}
			rels[`${entityId}.${subjectId}`] = {
				type: 'string',
				minLength: 1,
				enum: Object.keys(location)
			};
		}
	}
	return rels;
}

// Регистрирует кастомные сущности
export default function(manifest) {
	if (env.isPlugin(Plugins.idea)) {
		//todo Здесь нужно рефачить, чтобы запросы в бэк ходили
		query.expression(query.entitiesJSONSchema()).evaluate(manifest || {})
			.then((result) => {
				// Превращаем схему в строку для передачи в плагин
				const schema = JSON.stringify({
					...result,
					// Добавляем схемы связей с субъектами сущностей
					$rels: makeSubjectsRelationsSchema(manifest || {})
				});
				// Считаем контрольную сумму
				const crc = crc16(schema);
				// Отправляем в плагин только если схема изменилась
				if (crc != appliedSchemaCRC) {
					window.$PAPI.applyEntitiesSchema(schema);
					appliedSchemaCRC = crc;
				}
			// eslint-disable-next-line no-console
			}).catch((e) => console.error(e));
	}
}

// Обрабатывает кастомные сущности
import query from '@front/manifest/query';
import crc16 from '@global/helpers/crc16';
import env, {Plugins} from '@front/helpers/env';

let appliedSchemaCRC = null;

function convertEntityTypeToRef(subject) {
	const struct = (subject.type || '').split('.');
	subject.type = 'string';
	subject.$ref = `#/$defs/$ids/${struct[0]}/${struct[1] || '$default'}`;
}

function parseType(subject) {
	switch ((subject.type || '').toLowerCase()) {
		case 'object': parseSchemaObject(subject); break;
		case 'array': parseSchemaArray(subject); break;
		case 'string':
		case 'integer':
		case 'number':
		case 'boolean':
		case 'null': break;
		default:
			convertEntityTypeToRef(subject);
	}
}

function parseSchemaArray(schema) {
	parseType(schema.items);
}

function parseSchemaObject(schema) {
	const props = schema.properties || schema.patternProperties || {};
	for(const propId in props) {
		parseType(props[propId]);
	}
}

function appendObjectsIds(schema, manifest) {
	const ids = {};
	for (const entityId in manifest.entities || {}) {
		const objects = manifest.entities[entityId].objects || {
			$default: '/'
		};
		for (const objectId in objects) {
			const route = (objects[objectId].route || '/').split('/');
			let location = manifest[entityId] || {};
			for (let i = 1; i < route.length; i++) {
				location?.length && (location = location[route[i]] || {});
			}
			if (!ids[entityId]) ids[entityId] = {};
			ids[entityId][objectId] = {
				type: 'string',
				minLength: 1,
				enum: Object.keys(location)
			};
		}
	}
	schema.$defs.$ids = ids;
}

// Регистрирует кастомные сущности
export default function(manifest) {
	if (env.isPlugin(Plugins.idea)) {
		//todo Здесь нужно рефачить, чтобы запросы в бэк ходили
		query.expression(query.entitiesJSONSchema()).evaluate(manifest || {})
			.then((result) => {
				// Ищем в схеме типы указывающие на объекты сущностей
				parseSchemaObject(result);
				// Добавляем в схему идентификаторы объектов сущностей
				appendObjectsIds(result, manifest || {});
				// Превращаем схему в строку для передачи в плагин
				const schema = JSON.stringify(result);
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

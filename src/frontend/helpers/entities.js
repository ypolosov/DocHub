// Обрабатывает кастомные сущности
import query from '@front/manifest/query';
import crc16 from '@global/helpers/crc16';
import env, {Plugins} from '@front/helpers/env';

let appliedSchemaCRC = null;

// Регистрирует кастомные сущности
export default function(manifest) {
	if (env.isPlugin(Plugins.idea)) {
		//todo Здесь нужно рефачить, чтобы запросы в бэк ходили
		const schema = JSON.stringify(query.expression(query.entitiesJSONChema()).evaluate(manifest || {}));
		const crc = crc16(schema);
		if (crc != appliedSchemaCRC) {
			window.$PAPI.applyEntitiesSchema(schema);
			appliedSchemaCRC = crc;
		}
	}
}

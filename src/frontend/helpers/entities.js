// Обрабатывает кастомные сущности
import query from '@front/manifest/query';
import crc16 from '@global/helpers/crc16';
import env, {Plugins} from '@front/helpers/env';

let appliedSchemaCRC = null;

// Регистрирует кастомные сущности
export default function(manifest) {
	if (env.isPlugin(Plugins.idea)) {
		//todo Здесь нужно рефачить, чтобы запросы в бэк ходили
		query.expression(query.entitiesJSONChema()).evaluate(manifest || {})
			.then((result) => {
				debugger;
				const schema = JSON.stringify(result);
				const crc = crc16(schema);
				if (crc != appliedSchemaCRC) {
					window.$PAPI.applyEntitiesSchema(schema);
					appliedSchemaCRC = crc;
				}
			// eslint-disable-next-line no-console
			}).catch((e) => console.error(e));
	}
}

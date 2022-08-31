import YAML from 'yaml';

function normalizeResponse(type, content) {
	if (type === 'jpg') {
		return Buffer.from(content, 'base64');
	}

	if (type === 'yaml') {
		return YAML.parse(content);
	} 

	if (type === 'json') {
		return JSON.parse(content);
	} 

	if (type === 'plantuml') {
		return content;
	}

	return content;
}

export {
	normalizeResponse
};

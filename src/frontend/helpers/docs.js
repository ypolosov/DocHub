import uri from '@front/helpers/uri';
import gitlab from '@front/helpers/gitlab';

export default {
	urlFromProfile(profile, baseURI) {
		let result = null;
		// Устаревший признак "transport"
		const transport = (profile.transport || 'default').toLowerCase();
		if (transport === 'gitlab') {
			result = gitlab.makeFileURI(profile.project_id, profile.template || profile.source, profile.branch, 'raw');
		} else if (transport === 'http') {
			result = profile.source;
		} else {
			result = uri.makeURIByBaseURI(profile.template || profile.source, baseURI);
		}
		return result ? result.toString() : '';
	}
};

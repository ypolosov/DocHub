import mustache from 'mustache';
import jsonata from '../manifest/query';

window.DocHub = {
	api: {
		mustache
	},
	jsonata: jsonata.expression
};

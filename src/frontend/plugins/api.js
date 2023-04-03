import mustache from 'mustache';
import jsonata from '@front/manifest/query';

window.DocHub = {
  ...window.DocHub,
	api: {
		mustache
	},
	jsonata: jsonata.expression
};

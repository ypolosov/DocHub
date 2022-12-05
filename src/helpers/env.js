export default {
	isPlugin() {
		return process.env.VUE_APP_DOCHUB_MODE === 'plugin';
	},
	isVsPlugin() {
		return process.env.VUE_APP_DOCHUB_MODE === 'vs-plugin';
	},
	isProduction() {
		return process.env.NODE_ENV === 'production';
	}
};

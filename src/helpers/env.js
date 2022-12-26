export default {
	isPlugin() {
		return process.env.VUE_APP_DOCHUB_MODE === 'plugin';
	},
	isProduction() {
		return process.env.NODE_ENV === 'production';
	},

  get cache() {
    return ['GET', 'HEAD'].includes(process.env.VUE_APP_DOCHUB_CACHE)
      ? process.env.VUE_APP_DOCHUB_CACHE
      : null;
  }
};

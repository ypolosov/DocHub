export default {
	isPlugin() {
		return process.env.VUE_APP_DOCHUB_MODE === 'plugin';
	},
	isProduction() {
		return process.env.NODE_ENV === 'production';
	},

  get isCached() {
    return process.env.VUE_APP_DOCHUB_IS_CACHED === 'TRUE';
  },
  get cacheMethod() {
    return process.env.VUE_APP_DOCHUB_CACHE_REQ_METHOD ?? null;
  }
};

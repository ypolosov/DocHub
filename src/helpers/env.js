export default {
	isPlugin() {
		return process.env.VUE_APP_DOCHUB_MODE === 'plugin';
	},
	isVsPlugin() {
		return process.env.VUE_APP_DOCHUB_MODE === 'vs-plugin';
	},
	isProduction() {
		return process.env.NODE_ENV === 'production';
	},
  isTraceJSONata() {
    return (process.env.VUE_APP_DOCHUB_JSONATA_ANALYZER || 'N').toUpperCase() === 'Y';
  },
  get cache() {
    const currentMethod = (process.env.VUE_APP_DOCHUB_CACHE || 'NONE').toUpperCase();

    if (currentMethod === 'NONE') {
      return null;
    }

    if (['GET', 'HEAD'].includes(currentMethod)) {
      return currentMethod;
    }

    throw new Error(`Неправильно указан параметр "VUE_APP_DOCHUB_CACHE=${currentMethod}" в env!`);
  }
};

export type TCacheMethods = 'GET' | 'HEAD';

export default {
	isPlugin(): boolean {
		return process.env.VUE_APP_DOCHUB_MODE === 'plugin';
	},
	isVsPlugin(): boolean {
    return !!window.DochubVsCodeExt;
  },
	isProduction(): boolean {
		return process.env.NODE_ENV === 'production';
	},
  isTraceJSONata(): boolean {
    return (process.env.VUE_APP_DOCHUB_JSONATA_ANALYZER || 'N').toUpperCase() === 'Y';
  },
  get cache(): TCacheMethods | null {
    const currentMethod = (process.env.VUE_APP_DOCHUB_CACHE || 'NONE').toUpperCase();

    if (currentMethod === 'NONE') {
      return null;
    }

    if (['GET', 'HEAD'].includes(currentMethod)) {
      return currentMethod as TCacheMethods;
    }

    throw new Error(`Неправильно указан параметр "VUE_APP_DOCHUB_CACHE=${currentMethod}" в env!`);
  }
};

export type TCacheMethods = 'GET' | 'HEAD';

export enum Plugins {
  idea = 'idea',
  vscode = 'vscode'
}

export enum CACHE_LEVEL {
  low = 1,
  high = 2
}

export default {
  isPlugin(plugin?: Plugins): boolean {
    const isIdea = process.env.VUE_APP_DOCHUB_MODE === 'plugin';
    const isVsCode = !!window.DochubVsCodeExt;

    switch(plugin) {
      case Plugins.idea: {
        return isIdea;
      }
      case Plugins.vscode: {
        return isVsCode;
      }
      default: {
        return isIdea || isVsCode;
      }
    }
  },
	backendURL(): string {
		return process.env.VUE_APP_DOCHUB_BACKEND_URL;
	},

	isProduction(): boolean {
		return process.env.NODE_ENV === 'production';
	},
  isTraceJSONata(): boolean {
    return (process.env.VUE_APP_DOCHUB_JSONATA_ANALYZER || 'N').toUpperCase() === 'Y';
  },
  cacheWithPriority(priority: CACHE_LEVEL): boolean {
    const systemSetting = +process.env.VUE_APP_DOCHUB_CACHE_LEVEL;

    if (systemSetting in CACHE_LEVEL) {
      if (this.cache) {
        return systemSetting === priority;
      }
    } else if (systemSetting) {
      console.error(`Неправильно указан параметр "VUE_APP_DOCHUB_CACHE_LEVEL=${systemSetting}" в env!`);
    }

    return false;
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

import logger from '@back/utils/logger.mjs';

export type TCacheMethods = 'GET' | 'HEAD';
export type TProcessEnvValues = { [key: string | symbol]: any };

export enum Plugins {
  idea = 'idea',
  vscode = 'vscode'
}

export enum CACHE_LEVEL {
  low = 1,
  high = 2
}

const ENV_ERROR_TAG = '[env.dochub]';
const ENV_KEY_TAG = 'processEnv';

export default {
  isPlugin(plugin?: Plugins): boolean {
    const isIdea = this.dochub.VUE_APP_DOCHUB_MODE === 'plugin';
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
  // Адрес backend сервере
  backendURL(): string {
    return this.dochub.VUE_APP_DOCHUB_BACKEND_URL || window.origin;
  },
  // Адрес API доступа к файлам backend сервера
  backendFileStorageURL(): string {
    return (new URL('/core/storage/', this.backendURL())).toString();
  },
  isBackendMode() {
    return this.dochub.VUE_APP_DOCHUB_BACKEND_URL || ((this.dochub.VUE_APP_DOCHUB_MODE || '').toLowerCase() === 'backend');
  },
  isProduction(): boolean {
    return this.dochub.NODE_ENV === 'production';
  },
  isTraceJSONata(): boolean {
    return (this.dochub.VUE_APP_DOCHUB_JSONATA_ANALYZER || 'N').toUpperCase() === 'Y';
  },
  cacheWithPriority(priority: CACHE_LEVEL): boolean {
    const systemSetting = +this.dochub.VUE_APP_DOCHUB_CACHE_LEVEL;

    if (systemSetting in CACHE_LEVEL) {
      if (this.cache) {
        return systemSetting === priority;
      }
    } else if (systemSetting) {
      logger.error(`Неправильно указан параметр "VUE_APP_DOCHUB_CACHE_LEVEL=${systemSetting}" в env!`, ENV_ERROR_TAG);
    }

    return false;
  },
  get cache(): TCacheMethods | null {
    const currentMethod = (this.dochub.VUE_APP_DOCHUB_CACHE || 'NONE').toUpperCase();

    if (currentMethod === 'NONE') {
      return null;
    }

    if (['GET', 'HEAD'].includes(currentMethod)) {
      return currentMethod as TCacheMethods;
    }

    throw new Error(`Неправильно указан параметр "VUE_APP_DOCHUB_CACHE=${currentMethod}" в env!`);
  },
  dochub: new Proxy({
    [ENV_KEY_TAG]: {}
  } as TProcessEnvValues, {
    get: (target: { [ENV_KEY_TAG]: TProcessEnvValues }, prop?: symbol | string) => {
      if ((prop === ENV_KEY_TAG) || !prop) {
        return target[ENV_KEY_TAG];
      }

      return target[ENV_KEY_TAG][String(prop)];
    },
    set: (target: { [ENV_KEY_TAG]: TProcessEnvValues }, prop: string | symbol, value: TProcessEnvValues) => {
      if (value && typeof value !== 'object') {
        throw new Error(`${ENV_ERROR_TAG}: value=${value}, value должен быть объектом!`);
      } else if (String(prop) !== 'processEnv') {
        throw new Error(`${ENV_ERROR_TAG}: prop=${String(prop)}. Обратиться к объекту можно только через ${ENV_KEY_TAG}!`);
      }

      if (value) {
        target[ENV_KEY_TAG] = value;
      } else {
        target[ENV_KEY_TAG] = {};
      }

      return true;
    }
  })
};

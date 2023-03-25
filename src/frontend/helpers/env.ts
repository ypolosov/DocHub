import logger from '@back/utils/logger.mjs';

export type TCacheMethods = 'GET' | 'HEAD';
export type TEnvValue = string | undefined;
export type TProcessEnvValues = { [key: string | symbol]: TEnvValue };

export enum Plugins {
  idea = 'idea',
  vscode = 'vscode'
}

export enum CACHE_LEVEL {
  low = 1,
  high = 2
}

const ENV_ERROR_TAG = '[env.dochub]';

export default {
  dochub: <TProcessEnvValues>{},
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
  get rootDocument(): TEnvValue {
    return this.dochub.VUE_APP_DOCHUB_ROOT_DOCUMENT;
  },
  get rootManifest(): TEnvValue {
    return this.dochub.VUE_APP_DOCHUB_ROOT_MANIFEST;
  },
  get renderCore(): TEnvValue {
    return this.dochub.VUE_APP_DOCHUB_RENDER_CORE;
  },
  get gitlabUrl(): TEnvValue {
    return this.dochub.VUE_APP_DOCHUB_GITLAB_URL;
  },
  get appendDocHubMetamodel(): TEnvValue {
    return this.dochub.VUE_APP_DOCHUB_APPEND_DOCHUB_METAMODEL;
  },
  get appendDocHubDocs(): TEnvValue {
    return this.dochub.VUE_APP_DOCHUB_APPEND_DOCHUB_DOCS;
  },
  get appId(): TEnvValue {
    return this.dochub.VUE_APP_DOCHUB_APP_ID;
  },
  get clientSecret(): TEnvValue {
    return this.dochub.VUE_APP_DOCHUB_CLIENT_SECRET;
  },
  get personalToken(): TEnvValue {
    return this.dochub.VUE_APP_DOCHUB_PERSONAL_TOKEN;
  },
  get plantUmlServer(): TEnvValue {
    return this.dochub.VUE_APP_PLANTUML_SERVER;
  },
  get isAppendDocHubMetamodel(): boolean {
    return (this.appendDocHubMetamodel || 'y').toLowerCase() === 'y';
  },
  get isAppendDocHubDocs(): boolean {
    return (this.appendDocHubDocs || 'y').toLowerCase() === 'y';
  }
};

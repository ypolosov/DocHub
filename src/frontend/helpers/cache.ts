import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';

import {
  TAxios,
  TCacheData,
  TLastCachedResult,
  TCacheMethod,
  KEYS,
  TManifestProps
} from '@front/storage/indexedDB/types/idb.types';

import idb, { TCache } from '@front/storage/indexedDB';
import env from './env';

let Cache: TCache | null;

const useIdbKey = (key: string | object): string => JSON.stringify(key);

const initCache = async(): Promise<void> => {
  if (!Cache) {
    Cache = (await idb)?.cache;
  }
};

export const requestCacheInterceptor = async(
  params: TAxios<AxiosRequestConfig>
): Promise<void> => {
  await initCache();

  if (Cache) {
    if (params.reRequest) {
      params.method = 'GET';
      params.reRequest = false;
    } else {
      const lastCachedResult: TCacheData = await Cache.getData(useIdbKey(params.url));

      if (lastCachedResult && lastCachedResult.eTag) {
        params.method = env.cache as TCacheMethod;
        params.lastCachedResult = lastCachedResult;

        params.headers = {
          ...params.headers,
          'If-None-Match': lastCachedResult.eTag
        };
      }
    }
  }
};

export const responseCacheInterceptor = async(
  response: TAxios<AxiosResponse>
): Promise<AxiosRequestConfig | void> => {
  await initCache();

  if (Cache) {
    if (
      response.config.method.toUpperCase() === 'HEAD' &&
      response.status === 200
    ) {
      (response.config as TLastCachedResult).reRequest = true;
      return response.config;
    }

    if (response.headers.etag) {
      const newCachedData: TCacheData = {
        id: useIdbKey(response.config.url),
        eTag: response.headers.etag,
        data: response.data
      };

      if ((response.config as TLastCachedResult).lastCachedResult) {
        await Cache.putData(newCachedData);
      } else {
        await Cache.setData(newCachedData);
      }
    }
  }
};

export const plantUmlCache: {
  set(umlUrl: string, response: AxiosResponse): Promise<void>;
  get(umlUri: string): Promise<TCacheData>
} = {
  async get(umlUri: string): Promise<TCacheData | null> {
    await initCache();

    if (Cache) {
      const cachedData: TCacheData = await Cache.getData(umlUri);
      return cachedData?.id === umlUri ? cachedData : null;
    }
  },
  async set(umlUri: string, response: AxiosResponse): Promise<void> {
    await initCache();

    if (Cache) {
      const cachedData: TCacheData = await Cache.getData(umlUri);

      const newCachedData: TCacheData = {
        id: umlUri,
        eTag: uuidv4(),
        data: response.data
      };

      if (cachedData) {
        await Cache.putData(newCachedData);
      } else {
        await Cache.setData(newCachedData);
      }
    }
  }
};

export const manifestCache: {
  set(manifest: TManifestProps): Promise<void>;
  get(): Promise<TManifestProps | null>
} = {
  async get(): Promise<TManifestProps | null> {
    await initCache();

    if (Cache) {
      const cachedData: TCacheData = await Cache.getData(KEYS.Manifest);
      return cachedData?.data ?? null;
    }
  },
  async set(manifest: TManifestProps): Promise<void> {
    await initCache();

    if (Cache) {
      const cachedData: TCacheData = await Cache.getData(KEYS.Manifest);

      const newCachedData: TCacheData = {
        id: KEYS.Manifest,
        eTag: uuidv4(),
        data: manifest
      };

      if (cachedData) {
        await Cache.putData(newCachedData);
      } else {
        await Cache.setData(newCachedData);
      }
    }
  }
};

import { AxiosRequestConfig, AxiosResponse } from 'axios';

import {
  TAxios,
  TCacheData,
  TLastCachedResult,
  TCacheMethod
} from '@/storage/indexedDB/types/idb.types';

import idb, { TCache } from '../storage/indexedDB';
import env from './env';

let Cache: TCache | null;

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
      const lastCachedResult: TCacheData = await Cache.getData(params.url);

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
        id: response.config.url,
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

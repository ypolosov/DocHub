import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';

import {
  TAxios,
  TCacheData,
  TLastCachedResult,
  TCacheMethod
} from '../storage/indexedDB/types/idb.types';

import idb, { TCache } from '../storage/indexedDB';
import env from './env';

let Cache: TCache | null;

const CACHE_ETAG = 'cacheETag_';

const initCache = async(): Promise<void> => {
  if (!Cache) {
    Cache = (await idb)?.cache;
  }
};

const getCustomTag = (time: string | number): string =>
  CACHE_ETAG + new Date(time).getTime();

const requestAdapter = (params: TAxios<AxiosRequestConfig>): void => {
  const plantUmlExpires = params.lastCachedResult.eTag.split(CACHE_ETAG)[1];

  if (
    +plantUmlExpires > new Date().getTime() &&
    params.lastCachedResult.id === params.url
  ) {
    params.adapter = (config: AxiosRequestConfig): AxiosPromise => {
      return new Promise((
        resolve: never,
        reject: (args: {
          response: AxiosResponse,
          config: AxiosRequestConfig
        }) => void
      ): void => reject({
        response: {
          config,
          request: {},
          status: 304,
          data: params.lastCachedResult.data,
          statusText: 'PLANTUML NOT MODIFIED',
          headers: {
            'content-type': 'image/svg+xml'
          }
        },
        config
      }));
    };
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
        params.method = env.cacheMethod as TCacheMethod ?? 'GET';
        params.lastCachedResult = lastCachedResult;

        if (params.lastCachedResult.eTag.includes(CACHE_ETAG)) {
          requestAdapter(params);
        } else {
          params.headers = {
            ...params.headers,
            'If-None-Match': lastCachedResult.eTag
          };
        }
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

    if (response.headers.etag || response.headers.expires) {
      const newCachedData: TCacheData = {
        id: response.config.url,
        eTag: response.headers.etag ?? getCustomTag(response.headers.expires),
        data: response.data
      };

      if ((response.config as TLastCachedResult).lastCachedResult) {
        await Cache.putData(newCachedData);
      } else {
        await Cache.setData(newCachedData);
      }
    } else {
      console.warn([
        'Не удалось закэшировать данные! Поля "etag/expires" отсутствуют в заголовках запроса!',
        response
      ]);
    }
  }
};

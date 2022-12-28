import {describe, expect, it} from '@jest/globals';

import * as store from '@/storage/indexedDB/core/store';
import config from '@/storage/indexedDB/cache/config.json';

describe('store', (): void => {
  describe('create', (): void => {
    it(`Должен создать store ${config.storeName} и вернуть его`, (): Promise<void> => {
      return store.create(config).then((store: IDBObjectStore): void => {
        expect(store instanceof IDBObjectStore).toEqual(true);
        expect(store.name).toEqual(config.storeName);
      });
    });
  });

  describe('get', (): void => {
    it(`Должен вернуть store ${config.storeName}`, (): Promise<void> => {
      return store.get(
        config.dbName,
        config.storeName
      ).then((store: IDBObjectStore): void => {
        expect(store instanceof IDBObjectStore).toEqual(true);
        expect(store.name).toEqual(config.storeName);
      });
    });
  });

  describe('clear', (): void => {
    it('Должен вернуть количество store-ов = 0', (): Promise<void> => {
      return store.clear(
        config.dbName,
        config.storeName
      ).then((res: boolean): void => expect(res).toEqual(true));
    });
  });

  describe('deleteStore', (): void => {
    it(`Должен удалить store ${config.storeName}`, (): Promise<void> => {
      return store.deleteStore(
        config.dbName,
        config.storeName,
        config.version
      ).then((res: boolean): void => expect(res).toEqual(true));
    });
  });
});

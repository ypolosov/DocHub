import {describe, expect, it} from '@jest/globals';

import * as store from '@front/storage/indexedDB/core/store';
import config from '@front/storage/indexedDB/cache/config.json';

describe('store', (): void => {
  describe('create', (): void => {
    it('Должен создать store "example:root" и вернуть его', (): Promise<void> => {
      return store.create({...config, storeName: 'example:root'}).then((store: IDBObjectStore): void => {
        expect(store instanceof IDBObjectStore).toEqual(true);
        expect(store.name).toEqual('example:root');
      });
    });
  });

  describe('get', (): void => {
    it('Должен вернуть store "example:root"', (): Promise<void> => {
      return store.get(
        config.dbName,
        'example:root'
      ).then((store: IDBObjectStore): void => {
        expect(store instanceof IDBObjectStore).toEqual(true);
        expect(store.name).toEqual('example:root');
      });
    });
  });

  describe('storeCount', (): void => {
    it('Должен вернуть количество сторов', (): Promise<void> => {
      return store.storeCount(
        config.dbName,
        'example:root'
      ).then((count: number): void => expect(typeof count).toEqual('number'));
    });
  });

  describe('clear', (): void => {
    it('Должен вернуть количество store-ов = 0', (): Promise<void> => {
      return store.clear(
        config.dbName,
        'example:root'
      ).then((res: boolean): void => expect(res).toEqual(true));
    });
  });

  describe('deleteStore', (): void => {
    it('Должен удалить store "example:root"', (): Promise<void> => {
      return store.deleteStore(
        config.dbName,
        'example:root'
      ).then((res: boolean): void => expect(res).toEqual(true));
    });
  });
});

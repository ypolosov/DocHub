import {describe, expect, it} from '@jest/globals';

import * as idb from '@front/storage/indexedDB/core/idb';

import { TIdbEvent } from '@front/storage/indexedDB/types/idb.types';
import { dbName, keyOptions } from '@front/storage/indexedDB/cache/config.json';

describe('idb', (): void => {
	describe('openDB', (): void => {
		it(`Должен вернуть DB(${dbName}) типа IDBDatabase`, (): Promise<void> =>
      idb.open({
        dbName,
        storeName: 'example:root',
        onupgradeneeded: (e: IDBVersionChangeEvent): void => {
          (e.target as IDBOpenDBRequest).result.createObjectStore('example:root', keyOptions);
        }
      }).then((db: IDBDatabase): void => {
        expect(db instanceof IDBDatabase).toEqual(true);
        expect(db.name).toEqual(dbName);
      })
    );
	});

	describe('getDB', (): void => {
		it(`Должен вернуть DB(${dbName}) типа IDBDatabase`, (): Promise<void> =>
      idb.get(dbName).then((db: IDBDatabase): void => {
        expect(db instanceof IDBDatabase).toEqual(true);
        expect(db.name).toEqual(dbName);
      })
    );
	});

	describe('closeDB', (): void => {
		it('Должен закрыть DB', (): Promise<void> =>
      idb.close(dbName).then((event: void) => expect(event).toBe(true))
    );
	});

	describe('deleteDB', (): void => {
		it('Должен вернуть undefined', (): Promise<void> =>
      idb.deleteDB(dbName).then((event: TIdbEvent): void =>
        expect(event.target.result).toEqual(undefined)
      )
    );
	});

  describe('dbVersion', (): void => {
    it('Должен вернуть версию DB', (): Promise<void> =>
      idb.dbVersion(dbName).then((version: number): void =>
        expect(version).toEqual(1)
      )
    );
  });
});

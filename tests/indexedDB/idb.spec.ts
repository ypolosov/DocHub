import {describe, expect, it} from '@jest/globals';

import * as idb from 'storage/indexedDB/core/idb';

import { TIdbEvent } from 'storage/indexedDB/types/idb.types';
import { dbName, version } from 'storage/indexedDB/cache/config.json';

describe('idb', (): void => {
	describe('openDB', (): void => {
		it(`Должен вернуть DB(${dbName}) типа IDBDatabase`, (): Promise<void> =>
      idb.open({ dbName, version }).then((db: IDBDatabase): void => {
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
});

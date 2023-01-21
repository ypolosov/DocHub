import {describe, expect, it} from '@jest/globals';

import { TCacheData } from '@/storage/indexedDB/types/idb.types';
import { checkIdbIdType } from '../helpers/types';

import * as store from '@/storage/indexedDB/core/store';
import * as data from '@/storage/indexedDB/core/data';

import config from '@/storage/indexedDB/cache/config.json';
import idbCacheData from '../default/idbCacheData.json';

const TEST_URL = 'http://localhost:8080/documentation/arch/rules.yaml';

describe('data', (): void => {
  describe(
    `getAll : получить все даты из ${config.storeName}(store=а) из db ${config.dbName}`,
    (): void => it('Должен вернуть массив', (): Promise<void> =>
      store.create(config)
        .then((): Promise<TCacheData[]> =>
          data.getAll<TCacheData>(config.dbName, config.storeName)
        )
        .then((allData: TCacheData[]): void =>
          expect(Array.isArray(allData)).toBe(true)
        )
    )
  );

  describe(
    `add : добавить одну дату ${config.storeName}(store) в db ${config.dbName}`,
    (): void => it('Должен вернуть id', (): Promise<void> =>
      data.add(
        config.dbName,
        config.storeName,
        idbCacheData as TCacheData
      ).then(checkIdbIdType)
    )
  );

  describe(
    `put : обновить дату в ${config.storeName}(store-е) в db ${config.dbName}`,
    (): void => it('Должен вернуть id', (): Promise<void> =>
      data.put(
        config.dbName,
        config.storeName,
        {
          ...idbCacheData as TCacheData,
          id: TEST_URL
        }).then(checkIdbIdType)
    )
  );

  describe(
    `get : получить дату по primaryKey - ${config.storeName}(store) из db ${config.dbName}`,
    (): void => it('Должен вернуть объект, где asyncapi="2.0.0"', (): Promise<void> =>
      data.get({
        dbName: config.dbName,
        storeName: config.storeName,
        indexName: config.indexes[0].name,
        value: TEST_URL
      }).then((_data: any): void =>
        expect(_data.data['asyncapi']).toEqual('2.0.0')
      )
    )
  );

  describe(
    'deleteByPrimaKey : удалить дату по primaryKey',
    (): void => it('Должен вернуть boolean(true)', (): Promise<void> =>
      data.deleteByPrimaKey(
        config.dbName,
        config.storeName,
        1
      ).then((res: boolean): void =>
        expect(res).toEqual(true)
      )
    )
  );
});

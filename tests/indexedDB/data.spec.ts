import {describe, expect, it} from '@jest/globals';

import { TCacheData } from '@front/storage/indexedDB/types/idb.types';
import { checkIdbIdType } from '../helpers/types';

import * as store from '@front/storage/indexedDB/core/store';
import * as data from '@front/storage/indexedDB/core/data';

import config from '@front/storage/indexedDB/cache/config.json';
import idbCacheData from '../default/idbCacheData.json';

const TEST_URL = 'http://localhost:8080/documentation/arch/rules.yaml';

describe('data', (): void => {
  describe(
    'getAll : получить все даты из "example:root"(store=а) из db ${config.dbName}',
    (): void => it('Должен вернуть массив', (): Promise<void> =>
      store.create({
        ...config, storeName:
          'example:root'
      })
        .then((): Promise<TCacheData[]> =>
          data.getAll<TCacheData>(config.dbName, 'example:root')
        )
        .then((allData: TCacheData[]): void =>
          expect(Array.isArray(allData)).toBe(true)
        )
    )
  );

  describe(
    `add : добавить одну дату "example:root"(store) в db ${config.dbName}`,
    (): void => it('Должен вернуть id', (): Promise<void> =>
      data.add(
        config.dbName,
        'example:root',
        idbCacheData as TCacheData
      ).then(checkIdbIdType)
    )
  );

  describe(
    `put : обновить дату в "example:root"(store-е) в db ${config.dbName}`,
    (): void => it('Должен вернуть id', (): Promise<void> =>
      data.put(
        config.dbName,
        'example:root',
        {
          ...idbCacheData as TCacheData,
          id: TEST_URL
        }).then(checkIdbIdType)
    )
  );

  describe(
    `get : получить дату по primaryKey - "example:root"(store) из db ${config.dbName}`,
    (): void => it('Должен вернуть объект, где asyncapi="2.0.0"', (): Promise<void> =>
      data.get({
        dbName: config.dbName,
        storeName: 'example:root',
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
        'example:root',
        1
      ).then((res: boolean): void =>
        expect(res).toEqual(true)
      )
    )
  );
});

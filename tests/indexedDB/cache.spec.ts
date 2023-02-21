import {describe, expect, it} from '@jest/globals';

import * as cache from '@/storage/indexedDB/cache';

import { checkIdbIdType } from '../helpers/types';

import idbCacheData from '../default/idbCacheData.json';

const TEST_URL = 'TEST_URL';

describe('cache', (): void => {
  describe(
    'init : создать store "example:root"',
    (): void => it('Должен вернуть объект типа IDBObjectStore', (): Promise<void> =>
      cache.init().then((data: IDBObjectStore): void =>
        expect(data).toBeInstanceOf(IDBObjectStore)
      )
    )
  );

  describe(
    'setData : добавить дату в store "example:root"',
    (): void => it('Должен вернуть id', (): Promise<void> =>
      cache.setData(idbCacheData).then(checkIdbIdType)
    )
  );

  describe(
    'putData : обновить дату в store-е "example:root"',
    (): void => it('Должен вернуть id', (): Promise<void> =>
      cache.putData({
        ...idbCacheData,
        id: TEST_URL
      }).then(checkIdbIdType)
    )
  );

  describe(
    'get : получить дату по eTag из store-а "example:root"',
    (): void => it('Должен вернуть объект, где asyncapi="2.0.0"', (): Promise<void> =>
      cache.getData(TEST_URL).then((_data: any): void =>
        expect(_data.data['asyncapi']).toEqual('2.0.0')
      )
    )
  );
});

import { create } from '../core/store';
import { get, add, put } from '../core/data';

import config from './config.json';
import { TCacheData } from '../types/idb.types';

const init = (): Promise<IDBObjectStore> => create(config);

const getData = (id: string): Promise<TCacheData> => get({
  dbName: config.dbName,
  storeName: config.storeName,
  indexName: config.indexes[0].name,
  value: id
});

const setData = (data: TCacheData): Promise<string | number> => add(
  config.dbName,
  config.storeName,
  data
);

const putData = (data: TCacheData): Promise<string | number> => put(
  config.dbName,
  config.storeName,
  data
);

export {
  init,
  getData,
  setData,
  putData
};

import env from '@front/helpers/env';
import { create } from '../core/store';
import { get, add, put } from '../core/data';

import config from './config.json';
import { TCacheData } from '../types/idb.types';

const storeName = env.rootManifest || 'dochub';

const init = (): Promise<IDBObjectStore> => create({
  ...config,
  storeName,
  version: config['version']
});

const getData = (id: string): Promise<TCacheData> => get({
  storeName,
  dbName: config.dbName,
  indexName: config.indexes[0].name,
  value: id
});

const setData = (data: TCacheData): Promise<string | number> => add(
  config.dbName,
  storeName,
  data
);

const putData = (data: TCacheData): Promise<string | number> => put(
  config.dbName,
  storeName,
  data
);

export {
  init,
  getData,
  setData,
  putData
};

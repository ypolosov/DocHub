import { TIndexes, TKeyOptions } from '../types/idb.types';
import { get as getDB, open as openDB } from './idb';

const create = async({
  dbName,
  storeName,
  version = 0,
  keyOptions = {},
  indexes = []
}: {
  dbName: string;
  storeName: string;
  version: number;
  keyOptions: TKeyOptions;
  indexes: TIndexes[];
}): Promise<IDBObjectStore> => {
  let store: IDBObjectStore;

  await openDB({
    dbName,
    version,
    onupgradeneeded(event: IDBVersionChangeEvent): void {
      const DB: IDBDatabase = (event.target as IDBOpenDBRequest).result;

      if (!DB.objectStoreNames.contains(storeName)) {
        store = DB.createObjectStore(storeName, keyOptions);

        indexes.forEach(e =>
          store.createIndex(e.name, e.keyPath, e?.options)
        );
      }
    }
  });

  return store;
};

const get = async(dbName: string, storeName: string): Promise<IDBObjectStore> => {
  const DB: IDBDatabase = await getDB(dbName);

  return new Promise((
    resolve: (store: IDBObjectStore) => void,
    reject: (err: Error) => void
  ): void => {
    if (DB.objectStoreNames.contains(storeName)) {
      const transaction: IDBTransaction = DB.transaction(storeName, 'readwrite');
      const store: IDBObjectStore = transaction.objectStore(storeName);

      resolve(store);
    } else {
      reject(new Error('Не тот store!'));
    }
  });
};

const deleteStore = async(
  dbName: string,
  storeName: string,
  version = 0
): Promise<boolean> => {
  await openDB({
    dbName,
    version,
    onupgradeneeded(event: IDBVersionChangeEvent): void {
      const DB: IDBDatabase = (event.target as IDBOpenDBRequest).result;

      if (DB.objectStoreNames.contains(storeName)) {
        DB.deleteObjectStore(storeName);
      }
    }
  });

  return true;
};

const clear = async(dbName: string, storeName: string): Promise<boolean> => {
  const store: IDBObjectStore = await get(dbName, storeName);

  if (store) {
    store.clear();
    return true;
  }
};

export {
  create,
  get,
  deleteStore,
  clear
};

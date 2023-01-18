import { TIdbEvent, TOnupgradeneeded } from '../types/idb.types';

const _db: { [key: string]: IDBDatabase } = {};

const open = async({ ...props }: {
  dbName: string;
  version: number;
  onupgradeneeded?: TOnupgradeneeded;
}): Promise<IDBDatabase> => {
  await close(props.dbName);

  return new Promise((resolve, reject): void => {
    const req: IDBOpenDBRequest = indexedDB.open(props.dbName, props.version);

    req.onsuccess = (event: TIdbEvent): void => {
      _db[props.dbName] = event.target.result;
      resolve(event.target.result);
    };

    req.onupgradeneeded = props?.onupgradeneeded;
    req.onerror = reject;
  });
};

const close = (dbName: string): Promise<boolean | void> => {
  const currentDB: IDBDatabase = _db[dbName];

  if (currentDB) {
    currentDB.close();
    delete _db[dbName];

    return Promise.resolve(true);
  } else {
    return Promise.resolve();
  }
};

const deleteDB = async(dbName: string): Promise<Event> => {
  await close(dbName);

  return new Promise((resolve, reject): void => {
    const dbConnect: IDBOpenDBRequest = indexedDB.deleteDatabase(dbName);

    dbConnect.onsuccess = resolve;
    dbConnect.onerror = reject;
  });
};

const get = (dbName: string): Promise<Awaited<IDBDatabase>> | Promise<IDBDatabase> => {
  const currentDB: IDBDatabase = _db[dbName];

  if (currentDB) {
    return Promise.resolve(currentDB);
  } else {
    return Promise.reject(new Error(`indexedDB не открыт! Откройте ${dbName} DB!`));
  }
};

export {
	open,
	close,
	get,
	deleteDB
};

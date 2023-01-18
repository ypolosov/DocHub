export type TIdbEvent = Event & { target: IDBOpenDBRequest };
export type TIdbRequest = Event & { target: IDBRequest };
export type TOnupgradeneeded = (event: IDBVersionChangeEvent) => void;

export type TKeyOptions = {
  autoIncrement?: boolean;
  keyPath?: string | string[] | null;
}

export type TIndexes = {
  name: string;
  keyPath: string | string[];
  options?: {
    multiEntry?: boolean;
    unique?: boolean;
  };
}

export type TCacheData = {
  id: string;
  eTag: string;
  data: any;
}

export type TCacheMethod = 'get' | 'GET' | 'head' | 'HEAD' | null;

export type TLastCachedResult = {
  lastCachedResult: TCacheData,
  reRequest?: boolean
};

export type TAxios<T> = T & TLastCachedResult;

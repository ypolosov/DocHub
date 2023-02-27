import * as cache from './cache';
import env from '@front/helpers/env';

export type TCache = typeof cache;

export type TIdbState = {
  cache: TCache
} | null;

export default (async(): Promise<TIdbState> => {
  if (!self.indexedDB) {
    console.warn('[indexedDB]: Браузер не поддерживает indexedDB!');
  } else if (!env.cache) {
    console.warn('[indexedDB]: Кэширование отключено.');
  } else {
    /**
     * Таблицы инициализировать здесь
     * Пример: await exampleTable.init();
     */
    await cache.init();

    /**
     * Вернуть инициализированные таблицы(добавить в объект)
     * Пример: return { cache, ...,  exampleTable, ..., }
     */
    return {
      cache
    };
  }

  return null;
})();

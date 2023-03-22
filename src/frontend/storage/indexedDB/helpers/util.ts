import appConfig from '@front/config';
import { TIndexes } from '../types/idb.types';

export const strReplace = (str: string): string =>
  str.replace(/\r\n|\r|\n|\s/g,'');

export const getCacheStoreName = () => strReplace(
  appConfig.root_manifest.split('.')[0].replace('/', ':')
);

export const iDbIndexesIsEqual = (
  indexNames: DOMStringList,
  indexes: TIndexes[]
): boolean => {
  const existIndexes = Object.values(indexNames);
  return (indexes.length === existIndexes.length) && !indexes.filter(
    (index: TIndexes): boolean => !existIndexes.includes(index.name)
  ).length;
};

import { TIndexes } from '../types/idb.types';

export const iDbIndexesIsEqual = (
  indexNames: DOMStringList,
  indexes: TIndexes[]
): boolean => {
  const existIndexes = Object.values(indexNames);
  return (indexes.length === existIndexes.length) && !indexes.filter(
    (index: TIndexes): boolean => !existIndexes.includes(index.name)
  ).length;
};

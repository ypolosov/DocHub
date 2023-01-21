import {expect} from '@jest/globals';

export const checkIdbIdType = (id: string | number): void => {
  const checked: string =
    typeof id === 'number'
      ? id + ''
      : typeof id !== 'string'
        ? ''
        : id;

  expect(checked).toBeTruthy();
};

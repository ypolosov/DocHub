import {describe, expect, it} from '@jest/globals';
import validator from '@global/rules/validators.mjs';
import dataset from '@global/datasets/driver.mjs';
import manifest from '../__mocks__/manifest.json';
import validatorFixtures from '../__fixtures__/validators.json';

describe('rules', () => {
  const problems= [];
  const pushProblems = validator => {
    problems.push(validator);
  };

  it('[validator]: Должен обработать без ошибок', done => {
    expect.assertions(1);
    expect(validator(dataset, manifest, pushProblems, pushProblems)).toBeUndefined();

    setTimeout(() => {
      expect.assertions(2);
      expect(problems).toEqual(validatorFixtures);

      done();
    });
  });
});

import {describe, expect, it} from '@jest/globals';
import driver from '@global/jsonata/driver.mjs';
import driverData from '../__mocks__/jsonata/driver.json';
import fixturesData from '../__fixtures__/jsonata/driver.json';
import manifest from '../__mocks__/manifest.json';

describe('jsonata', () => {

  describe('driver', () => {
    it('[expression&evaluate]: Должен обработать без ошибок', async() =>
      expect(
        await driver
          .expression(driverData.expression, driverData.self_)
          .evaluate(manifest))
        .toEqual(fixturesData)
    );
  });
});

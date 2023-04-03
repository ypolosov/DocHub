import {describe, expect, it} from '@jest/globals';
import backDataset from '@back/helpers/datasets.mjs';
import frontDataset from '@front/helpers/datasets';
import data from '../__mocks__/dataset/dataset.json';
import fixturesData from '../__fixtures__/dataset/dataset.json';

describe('dataset', () => {

  describe('front', () =>
    it('[parseSource]: Должен обработать без ошибок', async() =>
      await expect(
        frontDataset().parseSource(data.context, data.data, data.subject)
      ).resolves.toEqual(fixturesData)
    )
  );

  describe('back', () =>
    it('[parseSource]: Должен обработать без ошибок', async() =>
      await expect(backDataset({
        storage: {
          manifest: {}
        }
      }).parseSource(data.context, data.data, data.subject)).resolves.toEqual(fixturesData)
    )
  );
});

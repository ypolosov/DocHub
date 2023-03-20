import {describe, expect, it} from '@jest/globals';
import manifestParser from '@global/manifest/parser.mjs';
import cache, {mainFullPath} from '../utils/config';
import {mergeMapTester, manifestTester} from '../utils/testers';
import {manifestIsTrue} from '../utils/deepTypeTester';

// будет проходить по всему проекту(сущностям).
// если не указан флаг VUE_APP_DOCHUB_ROOT_MANIFEST, то по дефолту будет DocHub
describe('Parser', () => {
  beforeAll(() => {
    global.$paths = {
      file_storage: `${mainFullPath}public`
    };
    return manifestParser.cache = cache;
  });

  it('Должен обработать без ошибок', () => {
    expect(manifestParser.import('file:///$root$')).resolves.toBeUndefined();
  });

  it('mergeMap не должен быть пустым', () => {
      expect(Object.keys(manifestParser.mergeMap).length).not.toBe(0);
    }
  );

  it('manifest не должен быть пустым(по дефолту manifest=null)', () => {
      expect(manifestParser.manifest).not.toBeNull();
    }
  );

  it('Обработчик mergeMap-a, должен вернуть true', () => {
      expect(mergeMapTester(manifestParser.mergeMap)).toBeTruthy();
    }
  );

  it('Обработчик manifest-a, должен вернуть true', () => {
      expect(manifestTester(manifestParser.manifest)).toBeTruthy();
    }
  );

  it('Deep обработчик manifest-a, должен вернуть true', () => {
      expect(manifestIsTrue(manifestParser.manifest)).toBeTruthy();
    }
  );
});

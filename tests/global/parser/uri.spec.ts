import {describe, expect, it} from '@jest/globals';
import uriTool from '@global/manifest/tools/uri.mjs';
import config from '../__mocks__/uri/config.json';

describe('uri', (): void => {

  const uri = new uriTool(config);

  it('Должен вернуть сущность URI', (): void =>
    expect(uri.isURL('http://localhost:8080/main')).not.toBeNull()
  );

  it('[isURL]: Должен выдать ошибку', (): void =>
    expect(uri.isURL('main')).toBeNull()
  );

  it('[makeURIByBaseURI]: Должен вернуть сущность URI', (): void =>
    expect(uri.makeURIByBaseURI('entities/root.yaml', 'http://localhost:8080/documentation/root.yaml')).not.toBeNull()
  );

  it('[makeURL]: Должен вернуть сущность URI', (): void =>
    expect(uri.makeURL(
      'archdistrib.puml',
      'http://localhost:8080/documentation/docs/conception/root.yaml'
    )).not.toBeNull()
  );
});

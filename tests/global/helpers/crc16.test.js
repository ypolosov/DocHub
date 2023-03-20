import {describe, expect, it} from '@jest/globals';
import crc16 from '@global/helpers/crc16.js';
import { TextEncoder } from 'util';

describe('crc16', () => {

  global.TextEncoder = TextEncoder;

  it('Должен вернуть число', () =>
    expect(crc16('chrome')).toBe(56619)
  );
});

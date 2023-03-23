import {expect} from '@jest/globals';
import {SingleManifestTester} from './SingleManifestTester';

function areSingleManifestTesterEqual(a, b) {
  const isAVolume = a instanceof SingleManifestTester;
  const isBVolume = b instanceof SingleManifestTester;

  if (isAVolume && isBVolume) {
    return a.equals(b);
  } else if (isAVolume !== isBVolume) {
    return false;
  } else {
    return undefined;
  }
}

expect.addEqualityTesters([areSingleManifestTesterEqual]);

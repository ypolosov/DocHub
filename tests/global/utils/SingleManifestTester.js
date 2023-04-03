export class SingleManifestTester {
  constructor(manifest, mergeMap) {
    this.manifest = manifest;
    this.mergeMap = mergeMap;
  }

  get toStringify() {
    if (this.manifest && this.mergeMap) {
      return {
        manifest: JSON.stringify(this.manifest),
        mergeMap: JSON.stringify(this.mergeMap)
      };
    }

    return null;
  }

  equals(fixture) {
    const curStringifyInstance = this.toStringify;
    const fixtureStringifyInstance = fixture.toStringify;

    if (!curStringifyInstance || !fixtureStringifyInstance) {
      return false;
    } else if (curStringifyInstance.mergeMap === fixtureStringifyInstance.mergeMap) {
      return curStringifyInstance.manifest === fixtureStringifyInstance.manifest;
    }

    return false;
  }
}

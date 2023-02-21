module.exports = {
  'testEnvironment': 'jest-environment-jsdom',
  setupFiles: [
    'fake-indexeddb/auto'
  ],
  transformIgnorePatterns: [
    '<rootDir>/node_modules/'
  ],
  moduleDirectories: [
    'node_modules',
    'src'
  ],
  moduleNameMapper: {
    '^@/storage/(.*)': '<rootDir>/src/storage/$1',
    '^@/helpers/(.*)': '<rootDir>/src/helpers/$1'
  },
  moduleFileExtensions: [
    'js',
    'ts',
    'tsx',
    'vue'
  ],
  testTimeout: 5000,
  verbose: true
};

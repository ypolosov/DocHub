module.exports = {
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
    '^@/storage/(.*)': '<rootDir>/src/storage/$1'
  },
  moduleFileExtensions: [
    'js',
    'ts',
    'tsx',
    'vue'
  ],
  verbose: true
};

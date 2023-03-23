module.exports = {
  'testEnvironment': 'jest-environment-jsdom',
  setupFiles: [
    'fake-indexeddb/auto',
    'dotenv/config'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './babel-jest.config.js' }],
    '^.+\\.mjs$': ['babel-jest', { configFile: './babel-jest.config.js' }],
    '^.+\\.ts$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/'
  ],
  moduleDirectories: [
    'node_modules',
    'src'
  ],
  moduleNameMapper: {
    uuid: require.resolve('uuid'),
    '^@front/(.*)': '<rootDir>/src/frontend/$1',
    '^@global/(.*)': '<rootDir>/src/global/$1',
    '^@back/(.*)': '<rootDir>/src/backend/$1'
  },
  moduleFileExtensions: [
    'js',
    'ts',
    'tsx',
    'vue'
  ],
  verbose: true
};

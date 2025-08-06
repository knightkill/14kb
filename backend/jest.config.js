export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/test'],
  moduleNameMapper: {
    '^frontend/(.*)$': '<rootDir>/../frontend/$1',
    '^preact$': '<rootDir>/node_modules/preact/dist/preact.mjs',
    '^preact/hooks$': '<rootDir>/node_modules/preact/hooks/dist/hooks.mjs',
    '^preact/test-utils$': '<rootDir>/node_modules/preact/test-utils/dist/testUtils.mjs',
    '^htm$': '<rootDir>/node_modules/htm/dist/htm.mjs'
  }
}

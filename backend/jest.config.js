/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Tell Jest to use the CommonJS version of uuid specifically
  moduleNameMapper: {
    '^uuid$': require.resolve('uuid'),
  },
  transform: {
    // Ensure both TS and JS (from node_modules) get processed
    '^.+\\.(ts|js)$': ['ts-jest', {
      useESM: false, // Force CommonJS output
    }],
  },
  // Critically, tell Jest NOT to ignore uuid so it can be transformed
  transformIgnorePatterns: [
    "node_modules/(?!(uuid)/)"
  ],
  setupFilesAfterEnv: ["./tests/teardown.ts", './tests/mocks/mockPrismaSingleton.ts'],
};
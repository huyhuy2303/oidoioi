/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  setupFilesAfterEnv: [],
  forceExit: true,
  // mongodb-memory-server downloads a binary on first run; allow more time
  testTimeout: 180000
};

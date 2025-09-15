/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx'],
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/test/__mocks__/fileMock.js'
  }
};


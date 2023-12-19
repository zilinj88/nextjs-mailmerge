const nextJest = require('next/jest')

/** Load the .env files using dotenv-flow BEFORE nextJest does,
 * to make sure the ones loaded are the right ones.
 *
 * Note that the variables do not get overwritten once loaded,
 * and that we need to do this since nextJest
 * will only load test and production .envs for some reason.
 */
require('dotenv-flow').config({
  silent: true,
  purge_dotenv: true,
})
const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-node',
  detectOpenHandles: true,
  // From https://github.com/facebook/jest/issues/1456#issuecomment-600811247
  forceExit: true,
  testPathIgnorePatterns: ['/node_modules/'],
  // To fix firebase import issue with lib/trpc.back/permissions.test.ts.
  // https://github.com/firebase/firebase-admin-node/issues/1488#issuecomment-1008290036
  moduleNameMapper: {
    // Makes ~ alias work in jest tests
    '~/(.*)': '<rootDir>/$1',
  },
  // avoids infinite loops caused by @shelf/jest-mongodb package
  watchPathIgnorePatterns: ['globalConfig'],
}

// Workaround to define a custom transformIgnorePattern
// Necessary because p-map uses ES6 modules and jest does not recognize it by default
// This tells jest to transform the p-map module
// https://jestjs.io/pt-BR/docs/configuration#transformignorepatterns-arraystring
async function jestConfig() {
  const nextJestConfig = await createJestConfig(customJestConfig)()
  return nextJestConfig
}

module.exports = jestConfig

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",

  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            dynamicImport: true,
          },
          target: "es2022",
        },
        module: {
          type: "es6",
        },
      },
    ],
  },

  extensionsToTreatAsEsm: [".ts"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  testMatch: [
    "**/*.test.ts",
    "**/*.spec.ts",
  ],

  collectCoverage: true,

  coverageReporters: [
    "text",
    "lcov",
    "json-summary"
  ],
};
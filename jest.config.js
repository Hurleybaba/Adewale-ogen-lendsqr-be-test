/** @type {import('jest').Config} */
export default {
  // Use the ESM preset for ts-jest
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",

  // Tell Jest to treat .ts files as ESM
  extensionsToTreatAsEsm: [".ts"],

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  // Ignore the distribution folder so Jest doesn't run compiled files
  testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/node_modules/"],

  // Configure the transformer
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        diagnostics: {
          ignoreCodes: [151001, 151002],
        },

        useESM: true, 
      },
    ],
  },
};
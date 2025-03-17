module.exports = {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: [
    "<rootDir>/controllers/*.test.js",
    "<rootDir>/middlewares/*.test.js",
    "<rootDir>/helpers/*.test.js",
    "<rootDir>/config/*.test.js",
    "<rootDir>/routes/*.test.js"
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["controllers/**", "middlewares/**", "helpers/**", "config/**", "routes/**"],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
    },
  },
};

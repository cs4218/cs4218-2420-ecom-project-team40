module.exports = {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: [
    "<rootDir>/controllers/*.test.js", 
    "<rootDir>/middlewares/*.test.js"
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["controllers/**"],
  collectCoverageFrom: ["middlewares/**"],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
    },
  },
};

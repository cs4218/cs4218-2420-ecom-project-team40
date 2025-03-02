module.exports = {
  // name displayed during tests
  displayName: "frontend",

  // simulates browser environment in jest
  // e.g., using document.querySelector in your tests
  testEnvironment: "jest-environment-jsdom",

  // jest does not recognise jsx files by default, so we use babel to transform any jsx files
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },

  // tells jest how to handle css/scss imports in your tests
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
  },

  // ignore all node_modules except styleMock (needed for css imports)
  transformIgnorePatterns: ["/node_modules/(?!(styleMock\\.js)$)"],

  // only run these tests
  testMatch: [
    "<rootDir>/client/src/**/*.test.js",
    "<rootDir>/client/src/pages/Auth/*.test.js",
    "<rootDir>/client/src/pages/Search.test.js",
    "<rootDir>/client/src/context/*.test.js",
    "<rootDir>/client/src/components/Form/*.test.js",
    "<rootDir>/client/src/pages/HomePage.test.js",
  ],

  // jest code coverage
  collectCoverage: true,

  collectCoverageFrom: [
    "client/src/pages/Auth/**",
    "client/src/pages/user/**",
    "client/src/pages/Search.js",
    "client/src/context/search.js",
    "client/src/components/Form/SearchInput.js",
    "client/src/pages/HomePage.js",
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
    },
  },
};

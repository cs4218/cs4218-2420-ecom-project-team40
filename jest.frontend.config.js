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
    "<rootDir>/client/src/pages/About.test.js",
    "<rootDir>/client/src/pages/Categories.test.js",
    "<rootDir>/client/src/components/Form/CategoryForm.test.js",
    "<rootDir>/client/src/pages/Categories.test.js",
    "<rootDir>/client/src/pages/CategoryProduct.test.js",
    "<rootDir>/client/src/pages/Pagenotfound.test.js",
    "<rootDir>/client/src/components/Spinner.test.js",
    "<rootDir>/client/src/hooks/useCategory.test.js",
    "<rootDir>/client/src/pages/ProductDetails.test.js",
    "<rootDir>/client/src/pages/admin/CreateCategory.test.js",
    "<rootDir>/client/src/context/cart.test.js",
    "<rootDir>/client/src/**/*.test.js",
    "<rootDir>/client/src/pages/Auth/*.test.js",
    "<rootDir>/client/src/pages/Search.test.js",
    "<rootDir>/client/src/pages/CartPage.test.js",
    "<rootDir>/client/src/context/*.test.js",
    "<rootDir>/client/src/components/Form/*.test.js",
    "<rootDir>/client/src/components/Routes/Private.test.js",
    "<rootDir>/client/src/pages/HomePage.test.js",
    "<rootDir>/client/src/pages/Contact.test.js",
    "<rootDir>/client/src/pages/Policy.test.js",
    "<rootDir>/client/src/pages/ProductDetails.test.js",
    "<rootDir>/client/src/pages/admin/AdminDashboard.test.js",
    "<rootDir>/client/src/components/AdminMenu.test.js",
    "<rootDir>/client/src/components/UserMenu.test.js",
    "<rootDir>/client/src/pages/user/Profile.test.js",
    "<rootDir>/client/src/pages/admin/Users.test.js",
    "<rootDir>/client/src/pages/admin/Products.test.js",
    "<rootDir>/client/src/pages/admin/CreateProduct.test.js",
    "<rootDir>/client/src/pages/admin/UpdateProduct.test.js",
    "<rootDir>/client/src/components/Footer.test.js",
    "<rootDir>/client/src/components/Header.test.js",
    "<rootDir>/client/src/components/Layout.test.js",
  ],

  // jest code coverage
  collectCoverage: true,

  collectCoverageFrom: [
    "client/src/pages/About.js",
    "client/src/pages/Categories.js",
    "client/src/components/Form/CategoryForm.js",
    "client/src/pages/Categories.js",
    "client/src/pages/CategoryProduct.js",
    "client/src/pages/Pagenotfound.js",
    "client/src/components/Spinner.js",
    "client/src/hooks/useCategory.js",
    "<rootDir>/client/src/pages/admin/CreateCategory.js",
    "client/src/context/cart.js",
    "client/src/pages/Auth/**",
    "client/src/pages/CartPage.js",
    "client/src/pages/user/Dashboard.js",
    "client/src/pages/user/Orders.js",
    "client/src/pages/Search.js",
    "client/src/context/search.js",
    "client/src/context/auth.js",
    "client/src/components/Form/SearchInput.js",
    "client/src/components/Routes/Private.js",
    "client/src/pages/HomePage.js",
    "client/src/pages/Contact.js",
    "client/src/pages/Policy.js",
    "client/src/pages/ProductDetails.js",
    "client/src/pages/admin/AdminDashboard.js",
    "client/src/components/AdminMenu.js",
    "client/src/components/UserMenu.js",
    "client/src/pages/user/Profile.js",
    "client/src/pages/admin/Users.js",
    "client/src/pages/admin/Products.js",
    "client/src/pages/admin/CreateProduct.js",
    "client/src/pages/admin/UpdateProduct.js",
    "client/src/components/Footer.js",
    "client/src/components/Header.js",
    "client/src/components/Layout.js",
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
    },
  },
};

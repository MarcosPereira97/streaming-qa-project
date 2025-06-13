module.exports = {
  testEnvironment: "node",
  coverageDirectory: "./coverage",
  collectCoverageFrom: ["src/**/*.js", "!src/index.js", "!src/**/*.test.js"],
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],
  moduleDirectories: ["node_modules", "src"],
  verbose: true,
  testTimeout: 10000,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};

// Jest configuration for SIKI App

module.exports = {
  // Transform ES modules to CommonJS
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  
  // Ignore node_modules except for our modules
  transformIgnorePatterns: [
    "/node_modules/(?!@huggingface|@tensorflow)"
  ],
  
  // Setup file extensions
  moduleFileExtensions: [
    "js",
    "json",
    "jsx",
    "node"
  ],
  
  // Test environment
  testEnvironment: "node",
  
  // Collect coverage
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "server.js",
    "scripts/*.js",
    "!scripts/build.js",
    "!scripts/deploy.js",
    "!scripts/optimize.js"
  ]
};
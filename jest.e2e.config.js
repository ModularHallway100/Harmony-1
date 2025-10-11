// End-to-End Test Configuration for Harmony Music Platform
module.exports = {
  // Test environment for E2E tests
  testEnvironment: 'node',
  
  // Setup files for E2E tests
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/e2e-setup.js'
  ],
  
  // Test match patterns for E2E tests
  testMatch: [
    '<rootDir>/tests/e2e/**/*.test.js',
    '<rootDir>/tests/e2e/**/*.spec.js'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx', 'jsx'],
  
  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    '^.+\\.json$': 'jest-json-transform'
  },
  
  // Module name mapper for path aliases
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@server/(.*)$': '<rootDir>/server/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1'
  },
  
  // Test timeout - longer for E2E tests
  testTimeout: 60000,
  
  // Max workers
  maxWorkers: '10%', // Fewer workers for E2E tests
  
  // Verbose test output
  verbose: true,
  
  // Test results output
  testResultsProcessor: 'jest-junit',
  
  // Global test variables
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
      isolatedModules: true
    }
  },
  
  // Collect coverage for E2E tests (optional)
  collectCoverage: false, // Typically disabled for E2E tests
  
  // Test environment setup
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  
  // Setup files for E2E testing
  setupFiles: [
    '<rootDir>/tests/e2e-setup.js'
  ],
  
  // Global test variables
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
      isolatedModules: true
    }
  },
  
  // moduleNameMapper for mocking external dependencies
  moduleNameMapping: {
    '^express$': 'express-mock-req',
    '^mongoose$': 'mongoose-mock',
    '^redis$': 'redis-mock',
    '^jsonwebtoken$': 'jsonwebtoken-mock',
    '^bcryptjs$': 'bcryptjs-mock'
  },
  
  // Test setup and teardown
  globalSetup: '<rootDir>/tests/e2e/global-setup.js',
  globalTeardown: '<rootDir>/tests/e2e/global-teardown.js',
  
  // Additional test configuration for E2E tests
  testTimeout: 60000,
  maxWorkers: '10%',
  
  // Enable async test timeouts
  asyncTestTimeout: 60000,
  
  // Test reporter configuration
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'test-results/e2e', outputName: 'jest-junit.xml' }]
  ],
  
  // Test environment variables
  testEnvironment: 'node',
  
  // Additional configuration for browser testing
  testURL: 'http://localhost:3000',
  
  // Setup for browser testing
  setupFiles: [
    '<rootDir>/tests/e2e/browser-setup.js'
  ],
  
  // Global test setup
  globalSetup: '<rootDir>/tests/e2e/global-setup.js',
  
  // Global test teardown
  globalTeardown: '<rootDir>/tests/e2e/global-teardown.js'
};
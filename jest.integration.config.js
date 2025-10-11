// Integration Test Configuration for Harmony Music Platform
module.exports = {
  // Test environment for integration tests
  testEnvironment: 'node',
  
  // Setup files for integration tests
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/integration-setup.js'
  ],
  
  // Test match patterns for integration tests
  testMatch: [
    '<rootDir>/tests/integration/**/*.test.js',
    '<rootDir>/tests/integration/**/*.spec.js'
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
  
  // Test timeout - longer for integration tests
  testTimeout: 30000,
  
  // Max workers
  maxWorkers: '25%', // Fewer workers for integration tests
  
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
  
  // Collect coverage for integration tests
  collectCoverageFrom: [
    'server/**/*.js',
    'src/**/*.{js,jsx,ts,tsx}',
    '!server/index.js',
    '!server/config/**',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/coverage/**',
    '!**/tests/**'
  ],
  
  // Coverage thresholds for integration tests
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Test environment setup
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  
  // Setup files for integration testing
  setupFiles: [
    '<rootDir>/tests/integration-setup.js'
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
  globalSetup: '<rootDir>/tests/integration/global-setup.js',
  globalTeardown: '<rootDir>/tests/integration/global-teardown.js',
  
  // Additional test configuration for integration tests
  testTimeout: 30000,
  maxWorkers: '25%',
  
  // Enable async test timeouts
  asyncTestTimeout: 30000
};
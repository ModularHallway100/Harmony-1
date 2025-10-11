// Backend-specific Jest Configuration for Harmony Music Platform
module.exports = {
  // Test environment for backend tests
  testEnvironment: 'node',
  
  // Setup files for backend tests
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/backend-setup.js'
  ],
  
  // Test match patterns for backend
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js',
    '<rootDir>/server/**/__tests__/**/*.(js)',
    '<rootDir>/server/**/*.(test|spec).(js)'
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
  
  // Test timeout
  testTimeout: 15000,
  
  // Max workers
  maxWorkers: '50%',
  
  // Verbose test output
  verbose: true,
  
  // Test results output
  testResultsProcessor: 'jest-junit',
  
  // Snapshot serialization
  snapshotSerializers: [
    'enzyme-to-json/serializer'
  ],
  
  // Global test variables
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
      isolatedModules: true
    }
  },
  
  // Collect coverage for backend
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/index.js',
    '!server/config/**',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/coverage/**',
    '!**/tests/**'
  ],
  
  // Coverage thresholds for backend
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Test environment setup
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  
  // Setup files for backend testing
  setupFiles: [
    '<rootDir>/tests/backend-setup.js'
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
  }
};
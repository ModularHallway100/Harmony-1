// Performance Test Configuration for Harmony Music Platform
module.exports = {
  // Test environment for performance tests
  testEnvironment: 'node',
  
  // Setup files for performance tests
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/performance-setup.js'
  ],
  
  // Test match patterns for performance tests
  testMatch: [
    '<rootDir>/tests/performance/**/*.test.js',
    '<rootDir>/tests/performance/**/*.spec.js'
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
  
  // Test timeout - longer for performance tests
  testTimeout: 120000,
  
  // Max workers
  maxWorkers: '5%', // Very few workers for performance tests
  
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
  
  // Collect coverage for performance tests (optional)
  collectCoverage: false, // Typically disabled for performance tests
  
  // Test environment setup
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  
  // Setup files for performance testing
  setupFiles: [
    '<rootDir>/tests/performance-setup.js'
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
  globalSetup: '<rootDir>/tests/performance/global-setup.js',
  globalTeardown: '<rootDir>/tests/performance/global-teardown.js',
  
  // Additional test configuration for performance tests
  testTimeout: 120000,
  maxWorkers: '5%',
  
  // Enable async test timeouts
  asyncTestTimeout: 120000,
  
  // Test reporter configuration
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'test-results/performance', outputName: 'jest-junit.xml' }],
    ['jest-html-reporter', {
      pageTitle: 'Harmony Performance Test Report',
      outputPath: 'test-results/performance/report.html',
      includeSuiteFailure: true,
      includeFailureMsg: true
    }]
  ],
  
  // Performance test configuration
  testEnvironment: 'node',
  
  // Performance metrics collection
  collectPerformance: true,
  
  // Performance thresholds
  performanceThresholds: {
    // API response time thresholds (in ms)
    apiResponseTime: {
      average: 500,
      p95: 1000,
      p99: 1500
    },
    
    // Database query time thresholds (in ms)
    dbQueryTime: {
      average: 100,
      p95: 300,
      p99: 500
    },
    
    // Page load time thresholds (in ms)
    pageLoadTime: {
      average: 2000,
      p95: 3000,
      p99: 5000
    },
    
    // Memory usage thresholds (in MB)
    memoryUsage: {
      max: 512,
      average: 256
    },
    
    // CPU usage thresholds (in %)
    cpuUsage: {
      max: 80,
      average: 50
    }
  },
  
  // Benchmark configuration
  benchmark: {
    iterations: 100,
    warmupIterations: 10,
    delayBetweenIterations: 100
  },
  
  // Load testing configuration
  loadTest: {
    concurrentUsers: 100,
    rampUpTime: 60, // seconds
    testDuration: 300, // seconds
    thinkTime: 1000 // milliseconds
  }
};
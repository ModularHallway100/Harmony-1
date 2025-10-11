// Backend-specific Jest Configuration for Harmony Music Platform
module.exports = {
  // Test environment for backend tests
  testEnvironment: 'node',
  
  // Setup files for backend tests
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/backend-setup.js'
  ],
  
  // Additional setup files for integration and E2E tests
  globalSetup: '<rootDir>/tests/integration-setup.js',
  globalTeardown: '<rootDir>/tests/integration-teardown.js',
  
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
    '!server/middleware/**',
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
    },
    './server/routes/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './server/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './server/utils/': {
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
    '^bcryptjs$': 'bcryptjs-mock',
    'supertest': 'supertest-mock'
  },
  
  // Additional configuration for better performance
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest-backend',
  
  // Force test isolation
  resetModules: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Don't automatically mock modules
  automock: false,
  
  // Collect performance data
  testTimeout: 30000,
  
  // Enable parallel test execution
  maxWorkers: '50%',
  
  // Add test name pattern for filtering tests
  testNamePattern: null,
  
  // Add coverage path ignore patterns
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/'
  ],
  
  // Add detectOpenHandles to help with debugging
  detectOpenHandles: true,
  
  // Add forceExit to ensure Jest exits after all tests
  forceExit: true,
  
  // Add watch plugins for better development experience
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
    'jest-watch-coverage'
  ],
  
  // Add test environment setup for database testing
  testEnvironment: 'node',
  
  // Add global test setup for database connections
  globalSetup: '<rootDir>/tests/backend/global-setup.js',
  globalTeardown: '<rootDir>/tests/backend/global-teardown.js',
  
  // Add test match patterns for specific test types
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js',
    '<rootDir>/server/**/__tests__/**/*.(js)',
    '<rootDir>/server/**/*.(test|spec).(js)',
    '<rootDir>/tests/integration/**/*.test.js',
    '<rootDir>/tests/e2e/**/*.test.js'
  ],
  
  // Performance testing configuration
  performance: {
    // Enable performance testing
    enabled: true,
    
    // Performance thresholds (in milliseconds)
    thresholds: {
      // API performance thresholds
      api: {
        responseTime: 500,
        throughput: 100,
        errorRate: 0.01,
        cpuUsage: 70,
        memoryUsage: 70
      },
      
      // Database performance thresholds
      database: {
        queryTime: 200,
        connectionTime: 100,
        poolUsage: 80
      },
      
      // Cache performance thresholds
      cache: {
        hitRate: 0.9,
        responseTime: 50,
        memoryUsage: 80
      }
    },
    
    // Performance monitoring configuration
    monitoring: {
      // Enable real-time performance monitoring
      realtime: true,
      
      // Performance metrics to collect
      metrics: [
        'responseTime',
        'throughput',
        'errorRate',
        'cpuUsage',
        'memoryUsage',
        'networkLatency'
      ],
      
      // Alert thresholds
      alerts: {
        highResponseTime: 2000,
        highErrorRate: 0.05,
        highCpuUsage: 80,
        highMemoryUsage: 80
      }
    },
    
    // Load testing configuration
    load: {
      // Concurrent users for load testing
      concurrentUsers: 100,
      
      // Requests per second
      requestsPerSecond: 50,
      
      // Test duration in seconds
      duration: 300,
      
      // Ramp-up time in seconds
      rampUp: 60,
      
      // Scenarios
      scenarios: [
        {
          name: 'Normal Load',
          users: 50,
          duration: 300,
          rampUp: 30,
          requests: [
            {
              method: 'GET',
              path: '/api/tracks',
              weight: 40
            },
            {
              method: 'GET',
              path: '/api/artists',
              weight: 30
            },
            {
              method: 'POST',
              path: '/api/auth/login',
              weight: 20
            },
            {
              method: 'GET',
              path: '/api/playlists',
              weight: 10
            }
          ]
        },
        {
          name: 'Peak Load',
          users: 100,
          duration: 300,
          rampUp: 60,
          requests: [
            {
              method: 'GET',
              path: '/api/tracks',
              weight: 50
            },
            {
              method: 'GET',
              path: '/api/artists',
              weight: 30
            },
            {
              method: 'POST',
              path: '/api/auth/login',
              weight: 10
            },
            {
              method: 'GET',
              path: '/api/playlists',
              weight: 10
            }
          ]
        }
      ]
    }
  }
};
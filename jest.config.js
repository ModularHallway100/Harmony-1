// Jest Configuration for Harmony Music Platform
module.exports = {
  // Test environment - can be overridden per test suite
  testEnvironment: 'node',
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/__mocks__/browserMocks.js'
  ],
  
  // Additional setup files for different test types
  globalSetup: '<rootDir>/tests/backend-setup.js',
  globalTeardown: '<rootDir>/tests/backend-teardown.js',
  
  // Test match patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js',
    '<rootDir>/src/**/__tests__/**/*.(js|jsx|ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx', 'jsx'],
  
  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    '^.+\\.json$': 'jest-json-transform',
    '^.+\\.(css|scss|sass)$': 'jest-transform-css'
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    'server/**/*.js',
    'src/**/*.{js,jsx,ts,tsx}',
    '!server/index.js',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/coverage/**',
    '!**/tests/**',
    '!src/**/index.{js,jsx,ts,tsx}',
    '!src/**/vite-env.d.ts'
  ],
  
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'cobertura',
    'json-summary',
    'text-summary'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Specific thresholds for different directories
    './server/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
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
    './src/components/': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    './src/hooks/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/lib/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
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
  
  // Test setup and teardown
  globalSetup: '<rootDir>/tests/global-setup.js',
  globalTeardown: '<rootDir>/tests/global-teardown.js',
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
    'jest-watch-coverage'
  ],
  
  // Babel configuration
  babelDefaults: {
    presets: [
      ['@babel/preset-env', {
        targets: {
          node: 'current'
        }
      }],
      '@babel/preset-react',
      '@babel/preset-typescript'
    ],
    plugins: [
      '@babel/plugin-transform-runtime',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-object-rest-spread'
    ]
  },
  
  // Additional configuration for better test performance
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  
  // Force test isolation to prevent test pollution
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
  
  // Additional configuration for performance testing
  testResultsProcessor: 'jest-junit',
  
  // Performance test configuration
  performance: {
    // Enable performance testing
    enabled: true,
    
    // Performance thresholds (in milliseconds)
    thresholds: {
      // Frontend performance thresholds
      frontend: {
        firstContentfulPaint: 1000,
        largestContentfulPaint: 2500,
        firstInputDelay: 100,
        cumulativeLayoutShift: 0.1,
        timeToInteractive: 3000
      },
      
      // Backend performance thresholds
      backend: {
        apiResponseTime: 500,
        databaseQueryTime: 200,
        cacheResponseTime: 50
      },
      
      // Load testing thresholds
      load: {
        concurrentUsers: 100,
        requestsPerSecond: 50,
        errorRate: 0.01,
        averageResponseTime: 800,
        p95ResponseTime: 1500
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
    }
  },
  
  // Visual regression testing configuration
  visual: {
    // Enable visual regression testing
    enabled: true,
    
    // Visual testing tools
    tools: [
      'percy',
      'applitools',
      'local'
    ],
    
    // Visual testing configuration
    config: {
      // Percy configuration
      percy: {
        token: process.env.PERCY_TOKEN,
        widths: [375, 768, 1280],
        minHeight: 600,
        PercyCSS: ''
      },
      
      // Applitools configuration
      applitools: {
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'Harmony Music Platform',
        batchName: 'Jest Visual Regression Tests',
        browser: [
          { name: 'chrome', width: 1280, height: 720 },
          { name: 'firefox', width: 1280, height: 720 },
          { name: 'safari', width: 1280, height: 720 },
          { name: 'iphone x', width: 375, height: 812 },
          { name: 'pixel 2', width: 411, height: 731 }
        ]
      },
      
      // Local visual testing configuration
      local: {
        // Directory to store screenshots
        screenshotDirectory: './screenshots',
        
        // Directory to store diff images
        diffDirectory: './diffs',
        
        // Threshold for image comparison (0-1)
        threshold: 0.01,
        
        // Ignore areas for comparison
        ignoreAreas: []
      }
    },
    
    // Visual test patterns
    testPatterns: [
      '**/components/**/*.tsx',
      '**/pages/**/*.tsx'
    ],
    
    // Visual test ignore patterns
    ignorePatterns: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      '**/tests/**'
    ]
  }
};
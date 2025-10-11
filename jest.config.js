// Jest Configuration for Harmony Music Platform
module.exports = {
  // Test environment - can be overridden per test suite
  testEnvironment: 'node',
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
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
    'json-summary'
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
    'jest-watch-typeahead/testname'
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
  }
};
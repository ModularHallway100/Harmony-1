// Frontend-specific Jest Configuration for Harmony Music Platform
module.exports = {
  // Test environment for frontend tests
  testEnvironment: 'jsdom',
  
  // Setup files for frontend tests
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/frontend-setup.js',
    '<rootDir>/tests/__mocks__/browserMocks.js',
    '<rootDir>/tests/visual-setup.js'
  ],
  
  // Test match patterns for frontend
  testMatch: [
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
  
  // Module name mapper for path aliases
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@server/(.*)$': '<rootDir>/server/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1'
  },
  
  // Test timeout
  testTimeout: 10000,
  
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
  
  // Jest configuration for React Testing Library
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  
  // moduleNameMapper for CSS and other assets
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '\\.(mp3|wav|ogg)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },
  
  // Collect coverage for frontend
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
    '!src/**/vite-env.d.ts',
    '!src/**/stories.{js,jsx,ts,tsx}',
    '!src/**/test-utils.{js,jsx,ts,tsx}',
    '!src/**/setup.{js,jsx,ts,tsx}',
    '!src/**/mocks.{js,jsx,ts,tsx}'
  ],
  
  // Coverage thresholds for frontend
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
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
    },
    './src/pages/': {
      branches: 65,
      functions: 65,
      lines: 65,
      statements: 65
    }
  },
  
  // Setup files for React Testing Library
  setupFiles: [
    'jest-canvas-mock'
  ],
  
  // TransformIgnorePatterns
  transformIgnorePatterns: [
    '/node_modules/(?!(react-dnd|react-dnd-html5-backend|@dnd-kit|@radix-ui)/)'
  ],
  
  // Add test environment setup for React Testing Library
  testEnvironment: 'jsdom',
  
  // Additional configuration for better performance
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest-frontend',
  
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
  
  // Add moduleNameMapper for additional asset types
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '\\.(mp3|wav|ogg)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '\\.(woff|woff2|ttf|eot)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '\\.(pdf|doc|docx)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },
  
  // Add setup files for additional mocking
  setupFiles: [
    'jest-canvas-mock',
    '<rootDir>/tests/__mocks__/browserMocks.js'
  ],
  
  // Add watch plugins for better development experience
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
    'jest-watch-coverage'
  ],
  
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
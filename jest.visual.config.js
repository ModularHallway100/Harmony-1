// Visual Regression Test Configuration for Harmony Music Platform
module.exports = {
  // Test environment for visual regression tests
  testEnvironment: 'jsdom',
  
  // Setup files for visual regression tests
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/visual-setup.js'
  ],
  
  // Test match patterns for visual regression tests
  testMatch: [
    '<rootDir>/tests/visual/**/*.test.js',
    '<rootDir>/tests/visual/**/*.spec.js'
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
  
  // Test timeout - longer for visual regression tests
  testTimeout: 30000,
  
  // Max workers
  maxWorkers: '25%',
  
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
  
  // Collect coverage for visual regression tests (optional)
  collectCoverage: false, // Typically disabled for visual regression tests
  
  // Test environment setup
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  
  // Setup files for visual regression testing
  setupFiles: [
    '<rootDir>/tests/visual-setup.js'
  ],
  
  // Global test variables
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
      isolatedModules: true
    }
  },
  
  // moduleNameMapper for CSS and other assets
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '\\.(mp3|wav|ogg)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },
  
  // Visual regression test configuration
  visualRegression: {
    // Percy configuration
    percy: {
      enabled: true,
      token: process.env.PERCY_TOKEN,
      widths: [375, 768, 1024, 1280], // Common device widths
      minimumThreshold: 0.01, // 1% difference allowed
      ignoreAreas: [
        // Ignore dynamic content like timestamps
        {
          selector: '.timestamp',
          type: 'element'
        },
        // Ignore user avatars
        {
          selector: '.user-avatar',
          type: 'element'
        },
        // Ignore specific colors
        {
          selector: '.notification-badge',
          type: 'color'
        }
      ],
      // Percy-specific configuration
        plugins: [
          '@percy/jest'
        ]
    },
    
    // Applitools configuration
    applitools: {
      enabled: false, // Disabled by default, can be enabled with API key
      apiKey: process.env.APPLITOOLS_API_KEY,
      appName: 'Harmony Music Platform',
      batchName: 'Visual Regression Tests',
      browsers: [
        {
          name: 'Chrome',
          width: 1024,
          height: 768
        },
        {
          name: 'Firefox',
          width: 1024,
          height: 768
        },
        {
          name: 'Safari',
          width: 1024,
          height: 768
        }
      ]
    },
    
    // Local visual regression configuration
    local: {
      enabled: true,
      screenshotDirectory: 'test-results/visual/screenshots',
      diffDirectory: 'test-results/visual/diffs',
      threshold: 0.01, // 1% difference allowed
      scale: 1,
      failureThresholdType: 'percent'
    }
  },
  
  // Test reporter configuration
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'test-results/visual', outputName: 'jest-junit.xml' }],
    ['jest-html-reporter', {
      pageTitle: 'Harmony Visual Regression Test Report',
      outputPath: 'test-results/visual/report.html',
      includeSuiteFailure: true,
      includeFailureMsg: true
    }]
  ],
  
  // Additional test configuration for visual regression tests
  testTimeout: 30000,
  maxWorkers: '25%',
  
  // Setup files for React Testing Library
  setupFiles: [
    'jest-canvas-mock'
  ],
  
  // TransformIgnorePatterns
  transformIgnorePatterns: [
    '/node_modules/(?!(react-dnd|react-dnd-html5-backend|@dnd-kit|@radix-ui)/)'
  ],
  
  // Visual testing utilities
  moduleNameMapping: {
    '@testing-library/react': '@testing-library/react',
    '@testing-library/jest-dom': '@testing-library/jest-dom',
    '@testing-library/user-event': '@testing-library/user-event',
    'jest-image-snapshot': 'jest-image-snapshot'
  }
};
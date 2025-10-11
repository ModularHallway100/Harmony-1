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
      widths: [375, 768, 1024, 1280, 1440, 1920], // Common device widths
      minimumThreshold: 0.01, // 1% difference allowed
      maximumThreshold: 0.05, // 5% difference allowed for flaky tests
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
        },
        // Ignore loading spinners
        {
          selector: '.loading-spinner',
          type: 'element'
        },
        // Ignore text content that changes frequently
        {
          selector: '.dynamic-text',
          type: 'text'
        }
      ],
      // Percy-specific configuration
      plugins: [
        '@percy/jest'
      ],
      // Percy-specific options
      renderOptions: {
        quality: 80,
        scaleFactor: 1,
        maxDiffPixels: 1000,
        maxDiffPixelRatio: 0.1
      }
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
        },
        {
          name: 'Edge',
          width: 1024,
          height: 768
        }
      ],
      // Applitools-specific options
      visualGridOptions: {
        stitchMode: 'CSS',
        waitBeforeCapture: 3000
      }
    },
    
    // Local visual regression configuration
    local: {
      enabled: true,
      screenshotDirectory: 'test-results/visual/screenshots',
      diffDirectory: 'test-results/visual/diffs',
      threshold: 0.01, // 1% difference allowed
      scale: 1,
      failureThresholdType: 'percent',
      // Local-specific options
      comparisonMethod: 'pixel',
      generateDiff: true,
      diffColor: {
        red: 255,
        green: 0,
        blue: 0,
        alpha: 0.5
      }
    },
    
    // Component-specific configurations
    components: {
      // Header component specific settings
      Header: {
        ignoreAreas: [
          {
            selector: '.notification-badge',
            type: 'element'
          }
        ],
        breakpoints: [375, 768, 1024]
      },
      // Music player component specific settings
      MusicPlayer: {
        ignoreAreas: [
          {
            selector: '.track-time',
            type: 'text'
          }
        ],
        breakpoints: [768, 1024, 1440]
      },
      // Artist gallery component specific settings
      ArtistGallery: {
        ignoreAreas: [
          {
            selector: '.artist-card .play-button',
            type: 'element'
          }
        ],
        breakpoints: [375, 768, 1024, 1440]
      }
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
    }],
    ['jest-visual-reporter', {
      outputPath: 'test-results/visual/visual-report.json',
      includeDiffImages: true
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
    'jest-image-snapshot': 'jest-image-snapshot',
    '@testing-library/react-hooks': '@testing-library/react-hooks'
  },
  
  // Additional configuration for better visual testing
  cache: false, // Disable caching for visual tests
  
  // Force test isolation
  resetModules: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Don't automatically mock modules
  automock: false,
  
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
  
  // Add visual test configuration
  visualTest: {
    // Image comparison configuration
    imageComparison: {
      // Comparison method: 'pixel' or 'ssim'
      method: 'ssim',
      
      // SSIM (Structural Similarity Index) threshold
      ssimThreshold: 0.95,
      
      // Pixel comparison threshold
      pixelThreshold: 0.01,
      
      // Ignore color differences
      ignoreColors: false,
      
      // Ignore antialiasing
      ignoreAntialiasing: true,
      
      // Allow slight differences in size
      allowSizeMismatch: false,
      
      // Crop images to comparison area
      crop: false
    },
    
    // Screenshot configuration
    screenshot: {
      // Format: 'png' or 'jpeg'
      format: 'png',
      
      // Quality for JPEG format (1-100)
      quality: 80,
      
      // Scale factor for high DPI displays
      scaleFactor: 1,
      
      // Capture full page or viewport
      fullPage: false,
      
      // Wait for animations before capturing
      waitForAnimations: true,
      
      // Timeout for waiting (ms)
      waitTimeout: 5000
    },
    
    // Diff configuration
    diff: {
      // Highlight differences
      highlight: true,
      
      // Diff color
      diffColor: {
        red: 255,
        green: 0,
        blue: 0,
        alpha: 0.5
      },
      
      // Diff size
      diffSize: 10,
      
      // Diff style
      diffStyle: 'outline'
    }
  }
};
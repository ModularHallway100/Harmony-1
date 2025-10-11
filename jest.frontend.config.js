// Frontend-specific Jest Configuration for Harmony Music Platform
module.exports = {
  // Test environment for frontend tests
  testEnvironment: 'jsdom',
  
  // Setup files for frontend tests
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/frontend-setup.js'
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
    '!src/**/test-utils.{js,jsx,ts,tsx}'
  ],
  
  // Coverage thresholds for frontend
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
  
  // Setup files for React Testing Library
  setupFiles: [
    'jest-canvas-mock'
  ],
  
  // TransformIgnorePatterns
  transformIgnorePatterns: [
    '/node_modules/(?!(react-dnd|react-dnd-html5-backend|@dnd-kit|@radix-ui)/)'
  ]
};
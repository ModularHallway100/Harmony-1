# Harmony Project Testing and Deployment Strategy

## Table of Contents
1. [Overview](#overview)
2. [Testing Framework](#testing-framework)
   - [Frontend Testing](#frontend-testing)
   - [Backend Testing](#backend-testing)
   - [Performance Testing](#performance-testing)
   - [Visual Regression Testing](#visual-regression-testing)
   - [Test Coverage](#test-coverage)
3. [CI/CD Pipeline](#cicd-pipeline)
   - [GitHub Actions Workflow](#github-actions-workflow)
   - [Build Process](#build-process)
   - [Testing Automation](#testing-automation)
4. [Deployment Strategy](#deployment-strategy)
   - [Environments](#environments)
   - [Blue-Green Deployment](#blue-green-deployment)
   - [Rollback Procedures](#rollback-procedures)
   - [Kubernetes Configuration](#kubernetes-configuration)
5. [Monitoring and Alerting](#monitoring-and-alerting)
   - [Application Monitoring](#application-monitoring)
   - [Infrastructure Monitoring](#infrastructure-monitoring)
   - Alerting System
6. [Runbooks](#runbooks)
   - [Troubleshooting Common Issues](#troubleshooting-common-issues)
   - [Emergency Procedures](#emergency-procedures)
7. [Security Considerations](#security-considerations)
8. [Performance Optimization](#performance-optimization)

## Overview

This document outlines the comprehensive testing and deployment strategy for the Harmony project, an AI-driven music streaming and prompt rewriting platform. The strategy ensures high-quality software delivery with minimal downtime, robust security, and optimal performance.

The Harmony project consists of:
- **Frontend**: React-based web application with TypeScript
- **Backend**: Node.js/Express API server
- **Database**: MongoDB for primary data, PostgreSQL for relational data
- **Cache**: Redis for session management and caching
- **Message Queue**: RabbitMQ for asynchronous processing
- **AI Services**: Dedicated services for AI-powered features
- **Search**: Elasticsearch for search functionality
- **Monitoring**: Prometheus and Grafana for observability

## Testing Framework

### Frontend Testing

#### Component Testing with React Testing Library

We use React Testing Library (RTL) for component testing, focusing on testing components from the user's perspective rather than implementation details.

**Key Features:**
- Tests are written in TypeScript alongside components
- Mock external dependencies and API calls
- Test user interactions and state changes
- Verify accessibility compliance

**Example Test Structure:**
```typescript
// src/components/Header/Header.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';
import { useAuth } from '../../hooks/use-auth';

// Mock the useAuth hook
jest.mock('../../hooks/use-auth');

describe('Header Component', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '1', name: 'Test User' },
      logout: jest.fn(),
    });
  });

  test('renders user name', () => {
    render(<Header />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  test('calls logout on logout button click', () => {
    const { logout } = useAuth();
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));
    expect(logout).toHaveBeenCalled();
  });
});
```

#### Hook Testing

Custom hooks are tested in isolation to ensure they behave as expected.

**Example Hook Test:**
```typescript
// src/hooks/use-theme.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './use-theme';

describe('useTheme Hook', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  test('initializes with light theme by default', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  test('toggles theme correctly', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });
});
```

#### Utility Function Testing

Utility functions are thoroughly tested to ensure reliability.

**Example Utility Test:**
```typescript
// src/lib/utils.test.ts
import {
  formatDuration,
  formatNumber,
  formatDate,
  validateEmail,
  generateSlug,
  truncateText,
} from './utils';

describe('Utility Functions', () => {
  describe('formatDuration', () => {
    test('formats seconds to MM:SS', () => {
      expect(formatDuration(65)).toBe('01:05');
      expect(formatDuration(3661)).toBe('61:01');
    });
  });

  describe('formatNumber', () => {
    test('formats numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1234567)).toBe('1,234,567');
    });
  });

  describe('validateEmail', () => {
    test('validates email addresses correctly', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
    });
  });
});
```

#### Frontend Test Configuration

Our Jest configuration for frontend testing includes:

```javascript
// jest.frontend.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js', '<rootDir>/tests/frontend-setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@/store/(.*)$': '<rootDir>/src/store/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(css|scss|sass)$': 'identity-obj-proxy',
    '^.+\\.(png|jpg|jpeg|gif|webp|avif|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/test/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/components/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/hooks/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/lib/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/coverage/',
  ],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.app.json',
    },
  },
  reporters: ['default', 'jest-junit', 'jest-html-reporter'],
  testTimeout: 10000,
  maxWorkers: '50%',
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
};
```

### Backend Testing

#### API Route Testing

We use Supertest for testing API endpoints, ensuring they behave as expected under various conditions.

**Example API Test:**
```javascript
// server/routes/auth.test.js
const request = require('supertest');
const express = require('express');
const authRoutes = require('./auth');
const authService = require('../services/auth-service');
const { setupDatabase, tearDownDatabase } = require('../test-setup');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth API Routes', () => {
  beforeAll(async () => {
    await setupDatabase();
  });

  afterAll(async () => {
    await tearDownDatabase();
  });

  describe('POST /auth/register', () => {
    test('should register a new user', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
    });

    test('should not register user with existing email', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Email already exists');
    });
  });

  describe('POST /auth/login', () => {
    test('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
    });

    test('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
});
```

#### Service Testing

Business logic services are tested in isolation with mocked dependencies.

**Example Service Test:**
```javascript
// server/services/auth-service.test.js
const authService = require('./auth-service');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

jest.mock('../models/user');
jest.mock('jsonwebtoken');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    test('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: '1',
        email: userData.email,
        name: userData.name,
      });

      const result = await authService.registerUser(userData);

      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(User.create).toHaveBeenCalledWith(userData);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
    });
  });

  describe('loginUser', () => {
    test('should login a user with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        id: '1',
        email: credentials.email,
        password: 'hashedpassword',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(user);
      jwt.sign.mockReturnValue('mocktoken');

      const result = await authService.loginUser(credentials);

      expect(User.findOne).toHaveBeenCalledWith({ email: credentials.email });
      expect(user.comparePassword).toHaveBeenCalledWith(credentials.password);
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
    });
  });
});
```

#### Middleware Testing

Middleware functions are tested to ensure they correctly handle requests and responses.

**Example Middleware Test:**
```javascript
// server/middleware/auth.test.js
const authMiddleware = require('./auth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('should authenticate with valid token', () => {
    const token = 'validtoken';
    const decodedToken = { userId: '1', email: 'test@example.com' };

    req.headers.authorization = `Bearer ${token}`;
    jwt.verify.mockReturnValue(decodedToken);

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
    expect(req.user).toEqual(decodedToken);
    expect(next).toHaveBeenCalled();
  });

  test('should return 401 without token', () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 with invalid token', () => {
    const token = 'invalidtoken';

    req.headers.authorization = `Bearer ${token}`;
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });
});
```

#### Backend Test Configuration

Our Jest configuration for backend testing includes:

```javascript
// jest.backend.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js', '<rootDir>/tests/backend-setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/server/$1',
    '^@/routes/(.*)$': '<rootDir>/server/routes/$1',
    '^@/services/(.*)$': '<rootDir>/server/services/$1',
    '^@/middleware/(.*)$': '<rootDir>/server/middleware/$1',
    '^@/utils/(.*)$': '<rootDir>/server/utils/$1',
    '^@/models/(.*)$': '<rootDir>/server/models/$1',
    '^@/config/(.*)$': '<rootDir>/server/config/$1',
  },
  transform: {
    '^.+\\.(ts|js)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'server/**/*.{ts,js}',
    '!server/**/*.d.ts',
    '!server/index.js',
    '!server/test/**',
    '!server/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './server/routes/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './server/services/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './server/middleware/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  testMatch: [
    '<rootDir>/server/**/__tests__/**/*.{ts,js}',
    '<rootDir>/server/**/*.{test,spec}.{ts,js}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/coverage/',
  ],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
  reporters: ['default', 'jest-junit', 'jest-html-reporter'],
  testTimeout: 15000,
  maxWorkers: '50%',
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
};
```

### Performance Testing

#### Load Testing with k6

We use k6 for load testing, simulating real-world traffic to identify performance bottlenecks.

**Example k6 Test Script:**
```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 500 }, // Ramp up to 500 users
    { duration: '10m', target: 500 }, // Stay at 500 users
    { duration: '2m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
  },
};

const BASE_URL = 'https://api.harmony.app';

export default function () {
  // Simulate user login
  let loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login status was 200': (r) => r.status === 200,
    'login response time < 500ms': (r) => r.timings.duration < 500,
  });

  let authToken = loginRes.json('token');

  // Simulate getting user profile
  let profileRes = http.get(`${BASE_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  check(profileRes, {
    'profile status was 200': (r) => r.status === 200,
    'profile response time < 300ms': (r) => r.timings.duration < 300,
  });

  // Simulate browsing music
  let musicRes = http.get(`${BASE_URL}/music/recommended`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  check(musicRes, {
    'music status was 200': (r) => r.status === 200,
    'music response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  // Simulate AI service request
  let aiRes = http.post(`${BASE_URL}/ai/generate`, JSON.stringify({
    prompt: 'Create a relaxing ambient track',
    style: 'ambient',
  }), {
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}` 
    },
  });

  check(aiRes, {
    'ai service status was 200': (r) => r.status === 200,
    'ai service response time < 5000ms': (r) => r.timings.duration < 5000,
  });

  sleep(1); // Think time between requests
}
```

#### Performance Monitoring

We implement performance monitoring to track application metrics in real-time.

**Example Performance Test Configuration:**
```javascript
// jest.performance.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js', '<rootDir>/tests/performance-setup.js'],
  testMatch: [
    '<rootDir>/tests/performance/**/*.test.{ts,js}',
  ],
  testTimeout: 60000, // 60 seconds timeout for performance tests
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
  reporters: ['default', 'jest-junit', 'jest-html-reporter', 'jest-performance'],
  collectCoverage: false,
  coverageDirectory: '<rootDir>/coverage/performance',
  collectCoverageFrom: [
    'server/**/*.ts',
    '!server/**/*.d.ts',
    '!server/test/**',
  ],
};
```

### Visual Regression Testing

#### Percy Integration

We use Percy for visual regression testing to catch UI changes across different browsers and devices.

**Example Percy Test:**
```javascript
// tests/visual/Header.spec.js
import { render, screen } from '@testing-library/react';
import { Header } from '../../src/components/Header';
import percySnapshot from '@percy/react';

describe('Header Visual Regression', () => {
  test('should match visual snapshot', () => {
    render(<Header />);
    
    // Take a Percy snapshot
    percySnapshot(Header, 'Header Component');
  });

  test('should match visual snapshot with user logged in', () => {
    // Mock user context
    jest.mock('../../src/contexts/UserContext', () => ({
      useUser: () => ({
        user: { id: '1', name: 'Test User', avatar: 'avatar.jpg' },
        logout: jest.fn(),
      }),
    }));

    render(<Header />);
    
    // Take a Percy snapshot
    percySnapshot(Header, 'Header Component - Logged In');
  });
});
```

#### Visual Test Configuration

Our Jest configuration for visual testing includes:

```javascript
// jest.visual.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js', '<rootDir>/tests/visual-setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: [
    '<rootDir>/tests/visual/**/*.spec.{ts,tsx}',
  ],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.app.json',
    },
  },
  reporters: ['default', '@percy/jest'],
};
```

### Test Coverage

We maintain high test coverage across the entire codebase with different thresholds for different types of code:

```javascript
// jest.config.js
module.exports = {
  // ... other configuration ...
  
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'server/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!server/**/*.d.ts',
    '!src/index.tsx',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!server/index.js',
    '!**/node_modules/**',
    '!**/test/**',
    '!**/tests/**',
    '!**/*.config.{ts,js}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/components/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/hooks/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/lib/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './server/routes/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './server/services/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './server/middleware/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'clover',
    'json-summary',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/coverage/',
  ],
};
```

## CI/CD Pipeline

### GitHub Actions Workflow

Our CI/CD pipeline is implemented using GitHub Actions, automating testing, building, and deployment processes.

**Main CI Workflow:**
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  NODE_VERSION: '18.x'
  REGISTRY: ghcr.io
  IMAGE_NAME: harmony-project

jobs:
  quality-check:
    name: Code Quality Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run ESLint
        run: npm run lint
        
      - name: Run TypeScript type checking
        run: npm run type-check
        
      - name: Check for security vulnerabilities
        run: npm audit --audit-level moderate

  frontend-tests:
    name: Frontend Tests
    runs-on: ubuntu-latest
    needs: quality-check
    
    strategy:
      matrix:
        test-type: [unit, integration]
        
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        if: matrix.test-type == 'e2e'
        run: npx playwright install --with-deps
        
      - name: Run frontend tests
        run: npm test -- --config jest.${{ matrix.test-type }}.config.js
        env:
          NODE_ENV: test
          
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: frontend
          name: frontend-coverage
          fail_ci_if_error: true

  backend-tests:
    name: Backend Tests
    runs-on: ubuntu-latest
    needs: quality-check
    
    strategy:
      matrix:
        test-type: [unit, integration]
        
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Start test database
        run: docker-compose -f docker-compose.test.yml up -d
        
      - name: Wait for database to be ready
        run: |
          until node -e "const { MongoClient } = require('mongodb'); client = new MongoClient(process.env.MONGODB_TEST_URL, { useNewUrlParser: true }); client.connect().then(() => { console.log('MongoDB is ready'); process.exit(0); }).catch(() => { console.log('Waiting for MongoDB...'); setTimeout(() => process.exit(1), 2000); })"; do
            sleep 2
          done
        env:
          MONGODB_TEST_URL: mongodb://localhost:27017/harmony_test
          
      - name: Run backend tests
        run: npm test -- --config jest.${{ matrix.test-type }}.config.js
        env:
          NODE_ENV: test
          MONGODB_URL: ${{ env.MONGODB_TEST_URL }}
          
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: backend
          name: backend-coverage
          fail_ci_if_error: true

  performance-tests:
    name: Performance Tests
    runs-on: ubuntu-latest
    needs: [frontend-tests, backend-tests]
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install k6
        run: |
          wget https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-windows-amd64.tar.gz
          tar -xzf k6-v0.47.0-windows-amd64.tar.gz
          sudo mv k6-v0.47.0-windows-amd64/k6 /usr/local/bin/
          
      - name: Run performance tests
        run: k6 run tests/performance/load-test.js
        env:
          BASE_URL: https://staging.harmony.app
          
      - name: Upload performance results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: ./performance-results

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: [frontend-tests, backend-tests]
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
          
      - name: Upload Trivy scan results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  build-and-push:
    name: Build and Push Docker Images
    runs-on: ubuntu-latest
    needs: [frontend-tests, backend-tests, performance-tests, security-scan]
    if: github.ref == 'refs/heads/main'
    
    permissions:
      contents: read
      packages: write
      
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        
      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v2
        
      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
            
      - name: Build and push frontend image
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile.frontend
          push: true
          tags: ${{ steps.meta.outputs.tags }}-frontend
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          
      - name: Build and push backend image
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile.backend
          push: true
          tags: ${{ steps.meta.outputs.tags }}-backend
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          
      - name: Build and push worker image
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile.worker
          push: true
          tags: ${{ steps.meta.outputs.tags }}-worker
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          
      - name: Build and push AI service image
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile.ai-service
          push: true
          tags: ${{ steps.meta.outputs.tags }}-ai-service
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Deploy to staging
        run: |
          aws eks update-kubeconfig --name harmony-staging-cluster --region us-east-1
          kubectl config use-context arn:aws:eks:us-east-1:123456789012:cluster/harmony-staging-cluster
          ./deploy.sh deploy-staging
          
      - name: Run smoke tests
        run: |
          npm run test:e2e -- --baseUrl https://staging.harmony.app

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build-and-push
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Deploy to production
        run: |
          aws eks update-kubeconfig --name harmony-production-cluster --region us-east-1
          kubectl config use-context arn:aws:eks:us-east-1:123456789012:cluster/harmony-production-cluster
          ./deploy.sh deploy-prod
          
      - name: Run smoke tests
        run: |
          npm run test:e2e -- --baseUrl https://app.harmony.app
          
      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Build Process

Our build process is optimized for efficiency and consistency:

1. **Frontend Build**:
   - TypeScript compilation with strict type checking
   - Vite bundling with code splitting and optimization
   - Static asset optimization and compression
   - Docker image creation with multi-stage builds

2. **Backend Build**:
   - TypeScript compilation with strict type checking
   - Dependency installation and pruning
   - Linting and security scanning
   - Docker image creation with multi-stage builds

3. **Worker Build**:
   - TypeScript compilation with strict type checking
   - Dependency installation and pruning
   - Docker image creation with multi-stage builds

4. **AI Service Build**:
   - Python dependency installation
   - Model optimization and packaging
   - Docker image creation with GPU support

### Testing Automation

Our CI/CD pipeline includes automated testing at multiple levels:

1. **Quality Checks**:
   - ESLint for code style
   - TypeScript type checking
   - Security vulnerability scanning

2. **Frontend Testing**:
   - Unit tests for components and utilities
   - Integration tests for data flow
   - E2E tests for user journeys
   - Visual regression testing

3. **Backend Testing**:
   - Unit tests for services and middleware
   - Integration tests for API endpoints
   - Database integration tests

4. **Performance Testing**:
   - Load testing with simulated user traffic
   - Performance benchmarking
   - API response time monitoring

5. **Security Testing**:
   - Vulnerability scanning
   - Dependency security checks
   - Container image security scanning

## Deployment Strategy

### Environments

We maintain multiple environments for different stages of development and deployment:

1. **Development Environment**:
   - Used by developers for daily work
   - Automated deployments on every merge to develop branch
   - Features are deployed as they're completed
   - May have instability and is not suitable for testing

2. **Staging Environment**:
   - Mirror of production environment
   - Deployed from the develop branch
   - Used for final testing before production
   - Includes all features planned for production
   - Performance and load testing are performed here

3. **Production Environment**:
   - Live environment for end-users
   - Deployed from the main branch
   - Includes only thoroughly tested and approved features
   - Monitored for performance and stability

### Blue-Green Deployment

We implement blue-green deployment strategy to achieve zero-downtime releases:

1. **Setup**:
   - Two identical production environments (Blue and Green)
   - Load balancer directing traffic to one environment at a time
   - Database shared between environments or synchronized

2. **Deployment Process**:
   - Deploy new version to the inactive environment (Green)
   - Run smoke tests and validation checks
   - Switch traffic from active (Blue) to inactive (Green) environment
   - Monitor for issues and rollback if necessary
   - Once stable, the previous environment (Blue) is ready for next deployment

3. **Kubernetes Implementation**:
   - Use Kubernetes Deployments with rolling updates
   - Implement readiness and liveness probes
   - Use Istio or similar service mesh for traffic shifting
   - Monitor deployment health with Prometheus and Grafana

### Rollback Procedures

We have well-defined rollback procedures for different failure scenarios:

1. **Automated Rollback**:
   - Triggered by health check failures
   - Automatic redeployment of previous stable version
   - Notification to operations team

2. **Manual Rollback**:
   - Initiated by operations team
   - Revert to previous stable deployment
   - Manual verification of rollback success

3. **Database Rollback**:
   - Point-in-time recovery from database backups
   - Roll forward to apply any necessary migrations
   - Verification of data integrity

4. **Scripted Rollback**:
   - Automated scripts for quick rollback
   - Documented rollback procedures
   - Regular testing of rollback procedures

### Kubernetes Configuration

Our Kubernetes configuration includes:

1. **Namespaces**:
   - Separate namespaces for different environments
   - Resource quotas and limits for each namespace
   - Network policies for isolation

2. **Deployments**:
   - Rolling updates with configurable strategies
   - Resource requests and limits
   - Health checks and probes
   - Pod affinity and anti-affinity rules

3. **Services**:
   - ClusterIP for internal communication
   - LoadBalancer for external access
   - Ingress for routing and SSL termination

4. **ConfigMaps and Secrets**:
   - Environment-specific configurations
   - Sensitive data stored as secrets
   - Configuration validation

5. **Persistent Storage**:
   - PersistentVolumeClaims for data persistence
   - Storage classes for different performance tiers
   - Backup and recovery procedures

## Monitoring and Alerting

### Application Monitoring

We implement comprehensive application monitoring:

1. **Metrics Collection**:
   - Application performance metrics
   - Error rates and exception tracking
   - Database query performance
   - Cache hit/miss ratios

2. **Logging**:
   - Structured logging with correlation IDs
   - Log aggregation and search
   - Log retention policies
   - Real-time log analysis

3. **Distributed Tracing**:
   - Request tracing across services
   - Performance bottlenecks identification
   - Dependency mapping

### Infrastructure Monitoring

We monitor infrastructure components:

1. **Cluster Health**:
   - Node resource utilization
   - Pod status and restarts
   - Network traffic and latency
   - Storage usage and performance

2. **Service Health**:
   - Service availability
   - Response times
   - Error rates
   - Throughput metrics

3. **Alerting**:
   - Threshold-based alerts
   - Escalation procedures
   - Alert suppression during maintenance
   - Alert dashboards and reports

### Alerting System

Our alerting system includes:

1. **Alert Channels**:
   - Slack notifications
   - Email alerts
   - PagerDuty for critical issues
   - Custom webhooks

2. **Alert Rules**:
   - CPU and memory usage thresholds
   - Error rate thresholds
   - Response time thresholds
   - Availability thresholds

3. **Alert Management**:
   - Alert grouping and deduplication
   - Alert annotation and documentation
   - Alert suppression during deployments
   - Alert review and closure procedures

## Runbooks

### Troubleshooting Common Issues

We have documented procedures for common issues:

1. **Application Performance Issues**:
   - Identify slow queries
   - Check cache performance
   - Review resource utilization
   - Analyze logs for errors

2. **Deployment Failures**:
   - Check deployment logs
   - Verify resource availability
   - Review configuration changes
   - Check for dependency issues

3. **Database Issues**:
   - Check database connectivity
   - Review query performance
   - Check disk space
   - Verify backup status

### Emergency Procedures

We have documented emergency procedures:

1. **Service Outage**:
   - Immediate notification to stakeholders
   - Activation of incident response team
   - Investigation and resolution
   - Post-incident review

2. **Data Corruption**:
   - Immediate isolation of affected systems
   - Activation of disaster recovery plan
   - Data restoration from backups
   - Verification of data integrity

3. **Security Breach**:
   - Immediate containment of breach
   - Investigation and forensic analysis
   - Communication with stakeholders
   - Implementation of security measures

## Security Considerations

We implement comprehensive security measures:

1. **Authentication and Authorization**:
   - Multi-factor authentication
   - Role-based access control
   - JWT token management
   - Session security

2. **Data Security**:
   - Encryption at rest and in transit
   - Data masking and redaction
   - Access controls and audit logging
   - Regular security assessments

3. **Infrastructure Security**:
   - Network security groups
   - Firewall rules
   - Intrusion detection and prevention
   - Regular vulnerability scanning

## Performance Optimization

We implement performance optimization strategies:

1. **Frontend Optimization**:
   - Code splitting and lazy loading
   - Image optimization and compression
   - Caching strategies
   - Performance monitoring

2. **Backend Optimization**:
   - Database query optimization
   - Caching strategies
   - Load balancing
   - Auto-scaling

3. **Infrastructure Optimization**:
   - Resource allocation based on demand
   - Cost optimization
   - Performance monitoring
   - Regular optimization reviews
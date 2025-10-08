// Test setup file
const { MongoMemoryServer } = require('mongodb-memory-server');
const { postgresConfig } = require('../server/config/postgres');

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.REDIS_ENABLED = 'false';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.POSTGRES_URL = 'postgresql://test:test@localhost:5432/test';
process.env.MONGODB_URL = 'mongodb://localhost:27017';
process.env.MONGODB_DB_NAME = 'test';

// Global test setup
let mongoServer;

beforeAll(async () => {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URL = mongoServer.getUri();
  
  // Connect to test databases
  // In a real test setup, you would connect to test databases
  console.log('Test databases initialized');
});

afterAll(async () => {
  // Clean up
  if (mongoServer) {
    await mongoServer.stop();
  }
  
  // Close any database connections
  console.log('Test databases cleaned up');
});

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
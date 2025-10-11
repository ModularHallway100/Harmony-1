// Backend Test Setup for Harmony Music Platform

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { postgresConnection } = require('../server/config/postgres');
const redis = require('redis');
const { createClient } = require('redis');

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
process.env.DB_NAME = 'harmony_test';
process.env.MONGODB_DB = 'harmony_test';

// MongoDB Memory Server
let mongoServer;
let redisClient;

// Setup function before all tests
beforeAll(async () => {
  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to MongoDB
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  // Connect to Redis for testing
  redisClient = createClient({
    url: 'redis://localhost:6379'
  });
  
  await redisClient.connect();
});

// Cleanup function after all tests
afterAll(async () => {
  // Close MongoDB connection
  await mongoose.disconnect();
  
  // Stop MongoDB Memory Server
  if (mongoServer) {
    await mongoServer.stop();
  }
  
  // Close Redis connection
  if (redisClient) {
    await redisClient.quit();
  }
});

// Setup function before each test
beforeEach(async () => {
  // Clear all collections in MongoDB
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  
  // Clear PostgreSQL tables
  await postgresConnection.query('TRUNCATE TABLE users, artists, tracks, playlists, user_likes, user_follows, comments, comment_likes, user_preferences, listening_history, ai_generations RESTART IDENTITY CASCADE');
  
  // Clear Redis
  await redisClient.flushDb();
});

// Global test utilities
global.createTestUser = async (userData = {}) => {
  const defaultUserData = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'password123',
    fullName: 'Test User',
    userType: 'listener'
  };
  
  const combinedUserData = { ...defaultUserData, ...userData };
  
  // Hash password
  const bcrypt = require('bcryptjs');
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(combinedUserData.password, saltRounds);
  
  // Insert user into database
  const result = await postgresConnection.query(
    `INSERT INTO users (email, username, password_hash, full_name, user_type)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, username, full_name, user_type`,
    [combinedUserData.email, combinedUserData.username, passwordHash, combinedUserData.fullName, combinedUserData.userType]
  );
  
  return result.rows[0];
};

global.createTestToken = (userId) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId, email: 'test@example.com', username: 'testuser', userType: 'listener' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

global.createTestRefreshToken = (userId) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId, email: 'test@example.com', username: 'testuser', userType: 'listener', tokenType: 'refresh' },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};

// Mock external services
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'Mocked AI response'
            }
          }]
        })
      }
    }
  }))
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-message-id' })
  })
}));

// Mock file upload
jest.mock('multer', () => ({
  __esModule: true,
  default: () => ({
    single: jest.fn((fieldName) => (req, res, next) => {
      // Mock file upload
      req.file = {
        fieldname: fieldName,
        originalname: 'test.mp3',
        encoding: '7bit',
        mimetype: 'audio/mpeg',
        size: 1024,
        destination: '/tmp',
        filename: 'test.mp3',
        path: '/tmp/test.mp3',
        buffer: Buffer.from('mock file content')
      };
      next();
    }),
    array: jest.fn((fieldName) => (req, res, next) => {
      // Mock multiple file uploads
      req.files = [
        {
          fieldname: fieldName,
          originalname: 'test1.mp3',
          encoding: '7bit',
          mimetype: 'audio/mpeg',
          size: 1024,
          destination: '/tmp',
          filename: 'test1.mp3',
          path: '/tmp/test1.mp3',
          buffer: Buffer.from('mock file content 1')
        },
        {
          fieldname: fieldName,
          originalname: 'test2.mp3',
          encoding: '7bit',
          mimetype: 'audio/mpeg',
          size: 1024,
          destination: '/tmp',
          filename: 'test2.mp3',
          path: '/tmp/test2.mp3',
          buffer: Buffer.from('mock file content 2')
        }
      ];
      next();
    })
  })
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'http://example.com/test' } }),
        remove: jest.fn().mockResolvedValue({ data: null, error: null })
      })
    },
    auth: {
      signUp: jest.fn().mockResolvedValue({ data: { user: { id: 'test-id' } }, error: null }),
      signIn: jest.fn().mockResolvedValue({ data: { user: { id: 'test-id' }, session: { access_token: 'test-token' } }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-id' } }, error: null })
    }
  })
}));

// Mock Cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: 'http://example.com/image.jpg' }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' })
    },
    api: {
      delete_resources: jest.fn().mockResolvedValue({ deleted: { 'test.jpg': 'deleted' } })
    }
  }
}));

// Console mock to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
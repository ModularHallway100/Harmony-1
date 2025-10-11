// Integration Test Setup for Harmony Music Platform

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { postgresConnection } = require('../server/config/postgres');
const redis = require('redis');
const { createClient } = require('redis');
const request = require('supertest');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const http = require('http');

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
process.env.DB_NAME = 'harmony_test';
process.env.MONGODB_DB = 'harmony_test';

// MongoDB Memory Server
let mongoServer;
let redisClient;

// Express app for integration tests
let app;
let server;
let io;

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
  
  // Setup Express app
  app = express();
  
  // Middleware
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  // Create HTTP server
  server = http.createServer(app);
  
  // Setup Socket.IO
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  
  // Connect to PostgreSQL
  await postgresConnection.connect();
  
  // Import and use routes
  const authRoutes = require('../server/routes/auth');
  const userRoutes = require('../server/routes/users');
  const artistRoutes = require('../server/routes/artists');
  const musicRoutes = require('../server/routes/music');
  const aiRoutes = require('../server/routes/ai');
  const subscriptionRoutes = require('../server/routes/subscriptions');
  const premiumFeaturesRoutes = require('../server/routes/premium-features');
  const fanSubscriptionRoutes = require('../server/routes/fan-subscriptions');
  const socialRoutes = require('../server/routes/social');
  const uploadRoutes = require('../server/routes/uploads');
  const promptRoutes = require('../server/routes/prompts');
  
  // Use routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/artists', artistRoutes);
  app.use('/api/music', musicRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/premium-features', premiumFeaturesRoutes);
  app.use('/api/fan-subscriptions', fanSubscriptionRoutes);
  app.use('/api/social', socialRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/prompts', promptRoutes);
  
  // Start server
  await new Promise((resolve) => {
    server.listen(0, resolve); // Use port 0 to get a random available port
  });
});

// Cleanup function after all tests
afterAll(async () => {
  // Close server
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  
  // Close Socket.IO
  if (io) {
    io.close();
  }
  
  // Close PostgreSQL connection
  await postgresConnection.end();
  
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
  await postgresConnection.query('TRUNCATE TABLE users, artists, tracks, playlists, user_likes, user_follows, comments, comment_likes, user_preferences, listening_history, ai_generations, subscriptions, premium_features, fan_subscriptions, social_interactions, prompt_templates, prompt_history RESTART IDENTITY CASCADE');
  
  // Clear Redis
  await redisClient.flushDb();
  
  // Reset server state
  if (server) {
    server.close();
    server = http.createServer(app);
    server.listen(0);
  }
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

global.createTestArtist = async (artistData = {}) => {
  const defaultArtistData = {
    name: 'Test Artist',
    bio: 'Test artist bio',
    genre: 'Pop',
    socialLinks: {
      twitter: 'https://twitter.com/testartist',
      instagram: 'https://instagram.com/testartist',
      website: 'https://testartist.com'
    }
  };
  
  const combinedArtistData = { ...defaultArtistData, ...artistData };
  
  // Insert artist into database
  const result = await postgresConnection.query(
    `INSERT INTO artists (name, bio, genre, social_links)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, bio, genre, social_links`,
    [
      combinedArtistData.name,
      combinedArtistData.bio,
      combinedArtistData.genre,
      JSON.stringify(combinedArtistData.socialLinks)
    ]
  );
  
  return result.rows[0];
};

global.createTestTrack = async (trackData = {}) => {
  const defaultTrackData = {
    title: 'Test Track',
    duration: 180,
    genre: 'Pop',
    lyrics: 'Test lyrics',
    metadata: {
      bpm: 120,
      key: 'C',
      energy: 0.7,
      danceability: 0.8
    }
  };
  
  const combinedTrackData = { ...defaultTrackData, ...trackData };
  
  // Insert track into database
  const result = await postgresConnection.query(
    `INSERT INTO tracks (title, duration, genre, lyrics, metadata)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, duration, genre, lyrics, metadata`,
    [
      combinedTrackData.title,
      combinedTrackData.duration,
      combinedTrackData.genre,
      combinedTrackData.lyrics,
      JSON.stringify(combinedTrackData.metadata)
    ]
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

// Mock Stripe
jest.mock('stripe', () => jest.fn().mockImplementation(() => ({
  customers: {
    create: jest.fn().mockResolvedValue({ id: 'cus_test123' }),
    retrieve: jest.fn().mockResolvedValue({ id: 'cus_test123', sources: { data: [{ id: 'pm_card_visa' }] } }),
    update: jest.fn().mockResolvedValue({ id: 'cus_test123' }),
    delete: jest.fn().mockResolvedValue({ deleted: true })
  },
  paymentMethods: {
    create: jest.fn().mockResolvedValue({ id: 'pm_card_visa', card: { brand: 'visa', last4: '4242' } })
  },
  subscriptions: {
    create: jest.fn().mockResolvedValue({ id: 'sub_test123', status: 'active' }),
    retrieve: jest.fn().mockResolvedValue({ id: 'sub_test123', status: 'active' }),
    update: jest.fn().mockResolvedValue({ id: 'sub_test123', status: 'active' }),
    cancel: jest.fn().mockResolvedValue({ id: 'sub_test123', status: 'canceled' })
  },
  products: {
    create: jest.fn().mockResolvedValue({ id: 'prod_test123' }),
    retrieve: jest.fn().mockResolvedValue({ id: 'prod_test123' })
  },
  prices: {
    create: jest.fn().mockResolvedValue({ id: 'price_test123' }),
    retrieve: jest.fn().mockResolvedValue({ id: 'price_test123' })
  },
  events: {
    constructEvent: jest.fn().mockImplementation((payload, signature, secret) => {
      return {
        id: 'evt_test123',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_test123' } }
      };
    })
  }
})));

// Integration testing utilities
global.integrationTestUtils = {
  // Make authenticated request
  makeAuthenticatedRequest: (method, path, data = {}, token) => {
    return request(app)
      [method.toLowerCase()](path)
      .send(data)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
  },
  
  // Make unauthenticated request
  makeUnauthenticatedRequest: (method, path, data = {}) => {
    return request(app)
      [method.toLowerCase()](path)
      .send(data)
      .set('Content-Type', 'application/json');
  },
  
  // Simulate WebSocket connection
  simulateWebSocketConnection: (userId) => {
    const socket = io.connect('http://localhost:3001', {
      reconnection: false,
      forceNew: true,
      query: { userId }
    });
    
    return new Promise((resolve) => {
      socket.on('connect', () => {
        resolve(socket);
      });
    });
  },
  
  // Simulate user interaction
  simulateUserInteraction: async (userId, action, data) => {
    const socket = await global.integrationTestUtils.simulateWebSocketConnection(userId);
    
    return new Promise((resolve) => {
      socket.emit(action, data);
      
      socket.on('action:response', (response) => {
        resolve(response);
      });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        resolve({ error: 'Timeout' });
      }, 5000);
    });
  },
  
  // Test API response structure
  validateApiResponse: (response, expectedFields) => {
    expect(response).toHaveProperty('status');
    expect(response).toHaveProperty('data');
    
    if (expectedFields) {
      expectedFields.forEach(field => {
        expect(response.data).toHaveProperty(field);
      });
    }
  },
  
  // Test error response structure
  validateErrorResponse: (response, expectedErrorCode) => {
    expect(response).toHaveProperty('status', 'error');
    expect(response).toHaveProperty('message');
    
    if (expectedErrorCode) {
      expect(response).toHaveProperty('code', expectedErrorCode);
    }
  }
};

// Mock console to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Export app and server for use in tests
module.exports = { app, server, io };
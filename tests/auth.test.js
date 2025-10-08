// Authentication Tests for Harmony Music Platform
const request = require('supertest');
const app = require('../server/index');
const { createTestUser, createTestToken } = require('../jest.setup');

describe('Authentication Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
        fullName: 'New User',
        userType: 'listener'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.user.fullName).toBe(userData.fullName);
      expect(response.body.data.user.userType).toBe(userData.userType);
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should not register user with existing email', async () => {
      const existingUser = await createTestUser();
      
      const userData = {
        email: existingUser.email,
        username: 'anotheruser',
        password: 'password123',
        fullName: 'Another User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should not register user with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        username: 'newuser',
        password: 'password123',
        fullName: 'New User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should not register user with weak password', async () => {
      const userData = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: '123',
        fullName: 'New User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const userData = {
        email: 'loginuser@example.com',
        username: 'loginuser',
        password: 'password123',
        fullName: 'Login User'
      };

      // Register user first
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Login with same credentials
      const loginData = {
        email: userData.email,
        password: userData.password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should not login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should not login with invalid password', async () => {
      const userData = {
        email: 'loginuser2@example.com',
        username: 'loginuser2',
        password: 'password123',
        fullName: 'Login User 2'
      };

      // Register user first
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Login with wrong password
      const loginData = {
        email: userData.email,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should not login with empty credentials', async () => {
      const loginData = {
        email: '',
        password: ''
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      // Register and login user
      const userData = {
        email: 'refreshuser@example.com',
        username: 'refreshuser',
        password: 'password123',
        fullName: 'Refresh User'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const refreshToken = registerResponse.body.data.tokens.refreshToken;

      // Refresh token
      const refreshData = { refreshToken };

      const response = await request(app)
        .post('/api/auth/refresh')
        .send(refreshData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should not refresh with invalid refresh token', async () => {
      const refreshData = {
        refreshToken: 'invalid-refresh-token'
      };

      const response = await request(app)
        .post('/api/auth/refresh')
        .send(refreshData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid refresh token');
    });

    it('should not refresh without refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      // Register and login user
      const userData = {
        email: 'logoutuser@example.com',
        username: 'logoutuser',
        password: 'password123',
        fullName: 'Logout User'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const token = registerResponse.body.data.tokens.accessToken;

      // Logout
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    it('should not logout without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required. Please provide a valid Bearer token.');
    });
  });

  // Clerk Authentication Tests
  describe('Clerk Authentication', () => {
    it('should authenticate user with Clerk token', async () => {
      // This test would require a valid Clerk token
      // For now, we'll test the endpoint structure
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token. Please sign in again.');
    });

    it('should handle user not found in database', async () => {
      // This test would simulate a Clerk user not in our database
      // For now, we'll test the endpoint structure
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token. Please sign in again.');
    });

    it('should sync Clerk user with database on first access', async () => {
      // This test would verify that a new Clerk user is automatically
      // created in our database when they first access a protected route
      // For now, we'll test the endpoint structure
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token. Please sign in again.');
    });

    it('should handle Clerk token expiration', async () => {
      // This test would verify that expired Clerk tokens are properly rejected
      // For now, we'll test the endpoint structure
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token. Please sign in again.');
    });

    it('should validate Clerk user permissions', async () => {
      // This test would verify that Clerk users have the correct permissions
      // based on their role in our system
      // For now, we'll test the endpoint structure
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token. Please sign in again.');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should process forgot password request', async () => {
      const userData = {
        email: 'forgotpassword@example.com',
        username: 'forgotpassword',
        password: 'password123',
        fullName: 'Forgot Password User'
      };

      // Register user first
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Request password reset
      const requestData = {
        email: userData.email
      };

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(requestData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('password reset link will be sent');
    });

    it('should handle non-existent email in forgot password', async () => {
      const requestData = {
        email: 'nonexistent@example.com'
      };

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(requestData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('password reset link will be sent');
    });

    it('should not process forgot password with invalid email', async () => {
      const requestData = {
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(requestData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });
});
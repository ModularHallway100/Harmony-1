const request = require('supertest');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./auth');
const authService = require('../services/auth-service');

// Create Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

// Mock the auth service
jest.mock('../services/auth-service');

describe('Auth Routes', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        fullName: 'Test User',
        userType: 'listener'
      };

      const mockResponse = {
        success: true,
        user: {
          id: 'user123',
          email: 'test@example.com',
          username: 'testuser',
          fullName: 'Test User',
          userType: 'listener'
        },
        token: 'mock-jwt-token'
      };

      authService.registerUser.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toEqual(mockResponse);
      expect(authService.registerUser).toHaveBeenCalledWith(userData);
    });

    it('should return error if user already exists', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        fullName: 'Test User',
        userType: 'listener'
      };

      authService.registerUser.mockRejectedValue(new Error('User with this email or username already exists'));

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toEqual({
        success: false,
        message: 'User with this email or username already exists'
      });
    });

    it('should return error if validation fails', async () => {
      const userData = {
        email: 'invalid-email',
        username: '', // Empty username
        password: '123', // Too short password
        fullName: 'Test User',
        userType: 'listener'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Validation failed',
        errors: expect.any(Array)
      });
    });

    it('should return error if request body is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Validation failed',
        errors: expect.any(Array)
      });
    });

    it('should handle server errors', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        fullName: 'Test User',
        userType: 'listener'
      };

      authService.registerUser.mockRejectedValue(new Error('Server error'));

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully with email', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse = {
        success: true,
        user: {
          id: 'user123',
          email: 'test@example.com',
          username: 'testuser',
          fullName: 'Test User',
          userType: 'listener'
        },
        token: 'mock-jwt-token'
      };

      authService.loginUser.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(authService.loginUser).toHaveBeenCalledWith(loginData);
    });

    it('should login user successfully with username', async () => {
      const loginData = {
        username: 'testuser',
        password: 'password123'
      };

      const mockResponse = {
        success: true,
        user: {
          id: 'user123',
          email: 'test@example.com',
          username: 'testuser',
          fullName: 'Test User',
          userType: 'listener'
        },
        token: 'mock-jwt-token'
      };

      authService.loginUser.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(authService.loginUser).toHaveBeenCalledWith(loginData);
    });

    it('should return error if credentials are invalid', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      authService.loginUser.mockRejectedValue(new Error('Invalid credentials'));

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid credentials'
      });
    });

    it('should return error if validation fails', async () => {
      const loginData = {
        email: 'invalid-email',
        password: '' // Empty password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Validation failed',
        errors: expect.any(Array)
      });
    });

    it('should return error if request body is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Validation failed',
        errors: expect.any(Array)
      });
    });

    it('should handle server errors', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      authService.loginUser.mockRejectedValue(new Error('Server error'));

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'mock-refresh-token';

      const mockResponse = {
        success: true,
        token: 'mock-jwt-token'
      };

      authService.refreshToken.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshToken);
    });

    it('should return error if refresh token is invalid', async () => {
      const refreshToken = 'invalid-refresh-token';

      authService.refreshToken.mockRejectedValue(new Error('Invalid refresh token'));

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid refresh token'
      });
    });

    it('should return error if refresh token is missing', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Validation failed',
        errors: expect.any(Array)
      });
    });

    it('should handle server errors', async () => {
      const refreshToken = 'mock-refresh-token';

      authService.refreshToken.mockRejectedValue(new Error('Server error'));

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      const token = 'mock-jwt-token';
      const decodedToken = { userId: 'user123' };

      // Mock jwt.verify to extract user ID
      jest.spyOn(require('jsonwebtoken'), 'verify').mockReturnValue(decodedToken);

      authService.logoutUser.mockResolvedValue({ success: true, message: 'Logged out successfully' });

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Logged out successfully'
      });
      expect(authService.logoutUser).toHaveBeenCalledWith('user123');
    });

    it('should return error if authorization header is missing', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Authorization token required'
      });
    });

    it('should return error if authorization header is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'InvalidToken')
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid authorization token'
      });
    });

    it('should handle server errors', async () => {
      const token = 'mock-jwt-token';
      const decodedToken = { userId: 'user123' };

      // Mock jwt.verify to extract user ID
      jest.spyOn(require('jsonwebtoken'), 'verify').mockReturnValue(decodedToken);

      authService.logoutUser.mockRejectedValue(new Error('Server error'));

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('PUT /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      const token = 'mock-jwt-token';
      const decodedToken = { userId: 'user123' };

      // Mock jwt.verify to extract user ID
      jest.spyOn(require('jsonwebtoken'), 'verify').mockReturnValue(decodedToken);

      const passwordData = {
        currentPassword: 'currentpassword',
        newPassword: 'newpassword123'
      };

      authService.changePassword.mockResolvedValue({
        success: true,
        message: 'Password changed successfully'
      });

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Password changed successfully'
      });
      expect(authService.changePassword).toHaveBeenCalledWith('user123', 'currentpassword', 'newpassword123');
    });

    it('should return error if authorization header is missing', async () => {
      const passwordData = {
        currentPassword: 'currentpassword',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/auth/change-password')
        .send(passwordData)
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Authorization token required'
      });
    });

    it('should return error if validation fails', async () => {
      const token = 'mock-jwt-token';
      const decodedToken = { userId: 'user123' };

      // Mock jwt.verify to extract user ID
      jest.spyOn(require('jsonwebtoken'), 'verify').mockReturnValue(decodedToken);

      const passwordData = {
        currentPassword: '',
        newPassword: '123' // Too short
      };

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Validation failed',
        errors: expect.any(Array)
      });
    });

    it('should return error if current password is incorrect', async () => {
      const token = 'mock-jwt-token';
      const decodedToken = { userId: 'user123' };

      // Mock jwt.verify to extract user ID
      jest.spyOn(require('jsonwebtoken'), 'verify').mockReturnValue(decodedToken);

      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      authService.changePassword.mockRejectedValue(new Error('Current password is incorrect'));

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Current password is incorrect'
      });
    });

    it('should handle server errors', async () => {
      const token = 'mock-jwt-token';
      const decodedToken = { userId: 'user123' };

      // Mock jwt.verify to extract user ID
      jest.spyOn(require('jsonwebtoken'), 'verify').mockReturnValue(decodedToken);

      const passwordData = {
        currentPassword: 'currentpassword',
        newPassword: 'newpassword123'
      };

      authService.changePassword.mockRejectedValue(new Error('Server error'));

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password successfully', async () => {
      const resetData = {
        email: 'test@example.com',
        newPassword: 'newpassword123'
      };

      authService.resetPassword.mockResolvedValue({
        success: true,
        message: 'Password reset successfully'
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Password reset successfully'
      });
      expect(authService.resetPassword).toHaveBeenCalledWith('test@example.com', 'newpassword123');
    });

    it('should return error if validation fails', async () => {
      const resetData = {
        email: 'invalid-email',
        newPassword: '123' // Too short
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Validation failed',
        errors: expect.any(Array)
      });
    });

    it('should return error if user not found', async () => {
      const resetData = {
        email: 'nonexistent@example.com',
        newPassword: 'newpassword123'
      };

      authService.resetPassword.mockRejectedValue(new Error('User not found'));

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'User not found'
      });
    });

    it('should handle server errors', async () => {
      const resetData = {
        email: 'test@example.com',
        newPassword: 'newpassword123'
      };

      authService.resetPassword.mockRejectedValue(new Error('Server error'));

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get user profile successfully', async () => {
      const token = 'mock-jwt-token';
      const decodedToken = { userId: 'user123' };

      // Mock jwt.verify to extract user ID
      jest.spyOn(require('jsonwebtoken'), 'verify').mockReturnValue(decodedToken);

      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'Test User',
        userType: 'listener'
      };

      authService.getUserById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        user: mockUser
      });
      expect(authService.getUserById).toHaveBeenCalledWith('user123');
    });

    it('should return error if authorization header is missing', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Authorization token required'
      });
    });

    it('should return error if authorization header is invalid', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidToken')
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid authorization token'
      });
    });

    it('should return error if user not found', async () => {
      const token = 'mock-jwt-token';
      const decodedToken = { userId: 'user123' };

      // Mock jwt.verify to extract user ID
      jest.spyOn(require('jsonwebtoken'), 'verify').mockReturnValue(decodedToken);

      authService.getUserById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'User not found'
      });
    });

    it('should handle server errors', async () => {
      const token = 'mock-jwt-token';
      const decodedToken = { userId: 'user123' };

      // Mock jwt.verify to extract user ID
      jest.spyOn(require('jsonwebtoken'), 'verify').mockReturnValue(decodedToken);

      authService.getUserById.mockRejectedValue(new Error('Server error'));

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('POST /api/auth/validate', () => {
    it('should validate token successfully', async () => {
      const token = 'mock-jwt-token';

      const mockResponse = {
        valid: true,
        user: {
          id: 'user123',
          email: 'test@example.com'
        }
      };

      authService.validateToken.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/auth/validate')
        .send({ token })
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(authService.validateToken).toHaveBeenCalledWith(token);
    });

    it('should return error if token is invalid', async () => {
      const token = 'invalid-token';

      authService.validateToken.mockResolvedValue({
        valid: false,
        error: 'Invalid token'
      });

      const response = await request(app)
        .post('/api/auth/validate')
        .send({ token })
        .expect(401);

      expect(response.body).toEqual({
        valid: false,
        error: 'Invalid token'
      });
    });

    it('should return error if token is missing', async () => {
      const response = await request(app)
        .post('/api/auth/validate')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Validation failed',
        errors: expect.any(Array)
      });
    });

    it('should handle server errors', async () => {
      const token = 'mock-jwt-token';

      authService.validateToken.mockRejectedValue(new Error('Server error'));

      const response = await request(app)
        .post('/api/auth/validate')
        .send({ token })
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error'
      });
    });
  });
});
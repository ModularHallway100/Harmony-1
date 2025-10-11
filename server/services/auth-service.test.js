const authService = require('./auth-service');
const { postgresConnection } = require('../config/postgres');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../config/postgres');

describe('Auth Service', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock bcrypt functions
    bcrypt.hash.mockResolvedValue('hashed-password');
    bcrypt.compare.mockResolvedValue(true);
    
    // Mock jwt functions
    jwt.sign.mockReturnValue('mock-jwt-token');
    jwt.verify.mockReturnValue({ userId: 'user123', email: 'test@example.com' });
    
    // Mock database connection
    postgresConnection.query = jest.fn();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      // Mock database response
      postgresConnection.query.mockResolvedValue({
        rows: [{
          id: 'user123',
          email: 'test@example.com',
          username: 'testuser',
          full_name: 'Test User',
          user_type: 'listener'
        }]
      });

      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        fullName: 'Test User',
        userType: 'listener'
      };

      const result = await authService.registerUser(userData);

      expect(result).toEqual({
        success: true,
        user: {
          id: 'user123',
          email: 'test@example.com',
          username: 'testuser',
          fullName: 'Test User',
          userType: 'listener'
        },
        token: 'mock-jwt-token'
      });

      // Verify bcrypt.hash was called
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      
      // Verify database insert query was called
      expect(postgresConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([
          'test@example.com',
          'testuser',
          'hashed-password',
          'Test User',
          'listener'
        ])
      );
    });

    it('should throw error if user already exists', async () => {
      // Mock database response for existing user
      postgresConnection.query
        .mockResolvedValueOnce({ rows: [{ id: 'user123', email: 'test@example.com' }] }) // Check email
        .mockResolvedValueOnce({ rows: [{ id: 'user456', username: 'testuser' }] }); // Check username

      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        fullName: 'Test User',
        userType: 'listener'
      };

      await expect(authService.registerUser(userData)).rejects.toThrow(
        'User with this email or username already exists'
      );
    });

    it('should handle database errors', async () => {
      // Mock database error
      postgresConnection.query.mockRejectedValue(new Error('Database error'));

      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        fullName: 'Test User',
        userType: 'listener'
      };

      await expect(authService.registerUser(userData)).rejects.toThrow('Database error');
    });
  });

  describe('loginUser', () => {
    it('should login user successfully with email', async () => {
      // Mock database response
      postgresConnection.query.mockResolvedValue({
        rows: [{
          id: 'user123',
          email: 'test@example.com',
          username: 'testuser',
          password_hash: 'hashed-password',
          full_name: 'Test User',
          user_type: 'listener'
        }]
      });

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await authService.loginUser(loginData);

      expect(result).toEqual({
        success: true,
        user: {
          id: 'user123',
          email: 'test@example.com',
          username: 'testuser',
          fullName: 'Test User',
          userType: 'listener'
        },
        token: 'mock-jwt-token'
      });

      // Verify bcrypt.compare was called
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      
      // Verify database query was called
      expect(postgresConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users'),
        ['test@example.com']
      );
    });

    it('should login user successfully with username', async () => {
      // Mock database response
      postgresConnection.query.mockResolvedValue({
        rows: [{
          id: 'user123',
          email: 'test@example.com',
          username: 'testuser',
          password_hash: 'hashed-password',
          full_name: 'Test User',
          user_type: 'listener'
        }]
      });

      const loginData = {
        username: 'testuser',
        password: 'password123'
      };

      const result = await authService.loginUser(loginData);

      expect(result).toEqual({
        success: true,
        user: {
          id: 'user123',
          email: 'test@example.com',
          username: 'testuser',
          fullName: 'Test User',
          userType: 'listener'
        },
        token: 'mock-jwt-token'
      });

      // Verify bcrypt.compare was called
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      
      // Verify database query was called
      expect(postgresConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users'),
        ['testuser']
      );
    });

    it('should throw error if user not found', async () => {
      // Mock empty database response
      postgresConnection.query.mockResolvedValue({ rows: [] });

      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      await expect(authService.loginUser(loginData)).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should throw error if password is incorrect', async () => {
      // Mock bcrypt.compare to return false
      bcrypt.compare.mockResolvedValue(false);

      // Mock database response
      postgresConnection.query.mockResolvedValue({
        rows: [{
          id: 'user123',
          email: 'test@example.com',
          username: 'testuser',
          password_hash: 'hashed-password',
          full_name: 'Test User',
          user_type: 'listener'
        }]
      });

      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      await expect(authService.loginUser(loginData)).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('should handle database errors', async () => {
      // Mock database error
      postgresConnection.query.mockRejectedValue(new Error('Database error'));

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      await expect(authService.loginUser(loginData)).rejects.toThrow('Database error');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'mock-refresh-token';
      const decodedToken = { userId: 'user123', email: 'test@example.com', tokenType: 'refresh' };

      // Mock jwt.verify
      jwt.verify.mockReturnValue(decodedToken);

      // Mock database check
      postgresConnection.query.mockResolvedValue({
        rows: [{ id: 'user123', refresh_token: 'mock-refresh-token' }]
      });

      const result = await authService.refreshToken(refreshToken);

      expect(result).toEqual({
        success: true,
        token: 'mock-jwt-token'
      });

      // Verify jwt.verify was called
      expect(jwt.verify).toHaveBeenCalledWith(refreshToken, expect.any(String));
      
      // Verify database query was called
      expect(postgresConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users'),
        ['user123']
      );
    });

    it('should throw error if refresh token is invalid', async () => {
      const refreshToken = 'invalid-refresh-token';

      // Mock jwt.verify to throw error
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
        'Invalid refresh token'
      );
    });

    it('should throw error if refresh token does not exist in database', async () => {
      const refreshToken = 'mock-refresh-token';
      const decodedToken = { userId: 'user123', email: 'test@example.com', tokenType: 'refresh' };

      // Mock jwt.verify
      jwt.verify.mockReturnValue(decodedToken);

      // Mock empty database response
      postgresConnection.query.mockResolvedValue({ rows: [] });

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
        'Refresh token not found'
      );
    });

    it('should throw error if refresh token is expired', async () => {
      const refreshToken = 'expired-refresh-token';
      const decodedToken = { userId: 'user123', email: 'test@example.com', tokenType: 'refresh' };

      // Mock jwt.verify
      jwt.verify.mockReturnValue(decodedToken);

      // Mock database check
      postgresConnection.query.mockResolvedValue({
        rows: [{ id: 'user123', refresh_token: null }]
      });

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
        'Refresh token expired or revoked'
      );
    });
  });

  describe('logoutUser', () => {
    it('should logout user successfully', async () => {
      const userId = 'user123';

      await authService.logoutUser(userId);

      // Verify database query was called to clear refresh token
      expect(postgresConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        [userId]
      );
    });

    it('should handle database errors', async () => {
      const userId = 'user123';

      // Mock database error
      postgresConnection.query.mockRejectedValue(new Error('Database error'));

      await expect(authService.logoutUser(userId)).rejects.toThrow('Database error');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = 'user123';
      const currentPassword = 'currentpassword';
      const newPassword = 'newpassword123';

      // Mock database response
      postgresConnection.query
        .mockResolvedValueOnce({ rows: [{ password_hash: 'hashed-current-password' }] }) // Get current password
        .mockResolvedValueOnce({ rows: [{ id: 'user123' }] }); // Update password

      // Mock bcrypt.compare
      bcrypt.compare.mockResolvedValue(true);

      // Mock bcrypt.hash
      bcrypt.hash.mockResolvedValue('hashed-new-password');

      const result = await authService.changePassword(userId, currentPassword, newPassword);

      expect(result).toEqual({
        success: true,
        message: 'Password changed successfully'
      });

      // Verify bcrypt.compare was called
      expect(bcrypt.compare).toHaveBeenCalledWith(currentPassword, 'hashed-current-password');
      
      // Verify bcrypt.hash was called
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 12);
      
      // Verify database update query was called
      expect(postgresConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        ['hashed-new-password', userId]
      );
    });

    it('should throw error if current password is incorrect', async () => {
      const userId = 'user123';
      const currentPassword = 'wrongpassword';
      const newPassword = 'newpassword123';

      // Mock database response
      postgresConnection.query.mockResolvedValue({
        rows: [{ password_hash: 'hashed-current-password' }]
      });

      // Mock bcrypt.compare
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.changePassword(userId, currentPassword, newPassword)).rejects.toThrow(
        'Current password is incorrect'
      );
    });

    it('should throw error if user not found', async () => {
      const userId = 'user123';
      const currentPassword = 'currentpassword';
      const newPassword = 'newpassword123';

      // Mock empty database response
      postgresConnection.query.mockResolvedValue({ rows: [] });

      await expect(authService.changePassword(userId, currentPassword, newPassword)).rejects.toThrow(
        'User not found'
      );
    });

    it('should handle database errors', async () => {
      const userId = 'user123';
      const currentPassword = 'currentpassword';
      const newPassword = 'newpassword123';

      // Mock database error
      postgresConnection.query.mockRejectedValue(new Error('Database error'));

      await expect(authService.changePassword(userId, currentPassword, newPassword)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const email = 'test@example.com';
      const newPassword = 'newpassword123';

      // Mock database response
      postgresConnection.query
        .mockResolvedValueOnce({ rows: [{ id: 'user123' }] }) // Check if user exists
        .mockResolvedValueOnce({ rows: [{ id: 'user123' }] }); // Update password

      // Mock bcrypt.hash
      bcrypt.hash.mockResolvedValue('hashed-new-password');

      const result = await authService.resetPassword(email, newPassword);

      expect(result).toEqual({
        success: true,
        message: 'Password reset successfully'
      });

      // Verify bcrypt.hash was called
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 12);
      
      // Verify database update query was called
      expect(postgresConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        ['hashed-new-password', 'user123']
      );
    });

    it('should throw error if user not found', async () => {
      const email = 'nonexistent@example.com';
      const newPassword = 'newpassword123';

      // Mock empty database response
      postgresConnection.query.mockResolvedValue({ rows: [] });

      await expect(authService.resetPassword(email, newPassword)).rejects.toThrow(
        'User not found'
      );
    });

    it('should handle database errors', async () => {
      const email = 'test@example.com';
      const newPassword = 'newpassword123';

      // Mock database error
      postgresConnection.query.mockRejectedValue(new Error('Database error'));

      await expect(authService.resetPassword(email, newPassword)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getUserById', () => {
    it('should get user by id successfully', async () => {
      const userId = 'user123';

      // Mock database response
      postgresConnection.query.mockResolvedValue({
        rows: [{
          id: 'user123',
          email: 'test@example.com',
          username: 'testuser',
          full_name: 'Test User',
          user_type: 'listener'
        }]
      });

      const result = await authService.getUserById(userId);

      expect(result).toEqual({
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'Test User',
        userType: 'listener'
      });

      // Verify database query was called
      expect(postgresConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users'),
        [userId]
      );
    });

    it('should return null if user not found', async () => {
      const userId = 'nonexistent';

      // Mock empty database response
      postgresConnection.query.mockResolvedValue({ rows: [] });

      const result = await authService.getUserById(userId);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const userId = 'user123';

      // Mock database error
      postgresConnection.query.mockRejectedValue(new Error('Database error'));

      await expect(authService.getUserById(userId)).rejects.toThrow('Database error');
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      const token = 'mock-jwt-token';
      const decodedToken = { userId: 'user123', email: 'test@example.com' };

      // Mock jwt.verify
      jwt.verify.mockReturnValue(decodedToken);

      // Mock database response
      postgresConnection.query.mockResolvedValue({
        rows: [{ id: 'user123' }]
      });

      const result = await authService.validateToken(token);

      expect(result).toEqual({
        valid: true,
        user: {
          id: 'user123',
          email: 'test@example.com'
        }
      });

      // Verify jwt.verify was called
      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
    });

    it('should return invalid if token is invalid', async () => {
      const token = 'invalid-token';

      // Mock jwt.verify to throw error
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await authService.validateToken(token);

      expect(result).toEqual({
        valid: false,
        error: 'Invalid token'
      });
    });

    it('should return invalid if user not found', async () => {
      const token = 'mock-jwt-token';
      const decodedToken = { userId: 'user123', email: 'test@example.com' };

      // Mock jwt.verify
      jwt.verify.mockReturnValue(decodedToken);

      // Mock empty database response
      postgresConnection.query.mockResolvedValue({ rows: [] });

      const result = await authService.validateToken(token);

      expect(result).toEqual({
        valid: false,
        error: 'User not found'
      });
    });
  });
});
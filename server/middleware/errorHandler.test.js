const errorHandler = require('./errorHandler');
const AppError = require('../utils/appError');

// Mock the console.error
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create mock request, response, and next function
    req = {
      originalUrl: '/api/test',
      method: 'GET',
      body: {},
      user: { id: 'user123', email: 'test@example.com' }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  describe('castErrorHandler', () => {
    it('should handle CastError for ObjectId', () => {
      const error = new Error('CastError');
      error.name = 'CastError';
      error.path = 'userId';
      error.kind = 'ObjectId';
      error.value = 'invalid-id';

      errorHandler.castErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid ID format',
        error: {
          path: 'userId',
          value: 'invalid-id'
        }
      });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle CastError for other paths', () => {
      const error = new Error('CastError');
      error.name = 'CastError';
      error.path = 'email';
      error.kind = 'string';
      error.value = 'not-an-email';

      errorHandler.castErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email format',
        error: {
          path: 'email',
          value: 'not-an-email'
        }
      });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should pass through if not a CastError', () => {
      const error = new Error('Some other error');

      errorHandler.castErrorHandler(error, req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('duplicateKeyErrorHandler', () => {
    it('should handle duplicate key error for email', () => {
      const error = new Error('MongoError');
      error.code = 11000;
      error.keyPattern = { email: 1 };
      error.keyValue = { email: 'duplicate@example.com' };

      errorHandler.duplicateKeyErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email already exists'
      });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle duplicate key error for username', () => {
      const error = new Error('MongoError');
      error.code = 11000;
      error.keyPattern = { username: 1 };
      error.keyValue = { username: 'duplicateuser' };

      errorHandler.duplicateKeyErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Username already exists'
      });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle generic duplicate key error', () => {
      const error = new Error('MongoError');
      error.code = 11000;
      error.keyPattern = { someField: 1 };
      error.keyValue = { someField: 'duplicate-value' };

      errorHandler.duplicateKeyErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Duplicate value'
      });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should pass through if not a duplicate key error', () => {
      const error = new Error('Some other error');

      errorHandler.duplicateKeyErrorHandler(error, req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('validationErrorHandler', () => {
    it('should handle validation errors', () => {
      const error = new Error('ValidationError');
      error.errors = {
        email: {
          message: 'Invalid email address',
          path: 'email',
          value: 'invalid-email'
        },
        password: {
          message: 'Password is too short',
          path: 'password',
          value: '123'
        }
      };

      errorHandler.validationErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: [
          {
            field: 'email',
            message: 'Invalid email address',
            value: 'invalid-email'
          },
          {
            field: 'password',
            message: 'Password is too short',
            value: '123'
          }
        ]
      });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle validation errors without details', () => {
      const error = new Error('ValidationError');
      error.errors = {
        name: {
          message: 'Name is required'
        }
      };

      errorHandler.validationErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: [
          {
            field: 'name',
            message: 'Name is required'
          }
        ]
      });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should pass through if not a validation error', () => {
      const error = new Error('Some other error');

      errorHandler.validationErrorHandler(error, req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('jwtErrorHandler', () => {
    it('should handle JWT errors', () => {
      const error = new Error('JsonWebTokenError');
      error.name = 'JsonWebTokenError';

      errorHandler.jwtErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token. Please log in again.'
      });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle JWT expired errors', () => {
      const error = new Error('TokenExpiredError');
      error.name = 'TokenExpiredError';
      error.expiredAt = new Date();

      errorHandler.jwtErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Your token has expired. Please log in again.'
      });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle JWT malformed errors', () => {
      const error = new Error('NotBeforeError');
      error.name = 'NotBeforeError';

      errorHandler.jwtErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token. Please log in again.'
      });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should pass through if not a JWT error', () => {
      const error = new Error('Some other error');

      errorHandler.jwtErrorHandler(error, req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('appErrorHandler', () => {
    it('should handle AppError with operational error', () => {
      const error = new AppError('Test operational error', 400, true);

      errorHandler.appErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Test operational error',
        isOperational: true
      });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle AppError with programming error', () => {
      const error = new AppError('Test programming error', 500, false);

      errorHandler.appErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
      expect(console.error).toHaveBeenCalledWith('ERROR 💥:', error);
    });

    it('should pass through if not an AppError', () => {
      const error = new Error('Some other error');

      errorHandler.appErrorHandler(error, req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('globalErrorHandler', () => {
    it('should handle development environment errors', () => {
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test (test.js:1:1)';

      errorHandler.globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: error,
        message: 'Test error',
        stack: error.stack
      });
      expect(console.error).toHaveBeenCalledWith('ERROR 💥:', error);
    });

    it('should handle production environment errors with operational error', () => {
      process.env.NODE_ENV = 'production';

      const error = new AppError('Test operational error', 400, true);

      errorHandler.globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Test operational error',
        isOperational: true
      });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle production environment errors with programming error', () => {
      process.env.NODE_ENV = 'production';

      const error = new Error('Test programming error');

      errorHandler.globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
      expect(console.error).toHaveBeenCalledWith('ERROR 💥:', error);
    });

    it('should handle unknown error type', () => {
      process.env.NODE_ENV = 'production';

      const error = 'Unknown error type';

      errorHandler.globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
      expect(console.error).toHaveBeenCalledWith('ERROR 💥:', error);
    });

    it('should handle error without status code', () => {
      process.env.NODE_ENV = 'production';

      const error = new AppError('Test error without status');
      delete error.statusCode;

      errorHandler.globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
      expect(console.error).toHaveBeenCalledWith('ERROR 💥:', error);
    });

    it('should handle error without message', () => {
      process.env.NODE_ENV = 'production';

      const error = new AppError('', 400, true);
      delete error.message;

      errorHandler.globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Something went wrong',
        isOperational: true
      });
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('logError', () => {
    it('should log error to console', () => {
      const error = new Error('Test error');
      const req = { method: 'GET', url: '/test' };
      const res = {};

      errorHandler.logError(error, req, res);

      expect(console.error).toHaveBeenCalledWith(
        'Error occurred:',
        error,
        'Request:',
        req
      );
    });

    it('should handle error without stack', () => {
      const error = new Error('Test error without stack');
      delete error.stack;
      const req = { method: 'POST', url: '/api/test' };
      const res = {};

      errorHandler.logError(error, req, res);

      expect(console.error).toHaveBeenCalledWith(
        'Error occurred:',
        error,
        'Request:',
        req
      );
    });
  });

  describe('notFoundHandler', () => {
    it('should handle 404 errors', () => {
      errorHandler.notFoundHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: `Can't find ${req.originalUrl} on this server!`
      });
      expect(console.error).toHaveBeenCalledWith(`Not Found: ${req.originalUrl}`);
    });

    it('should include method in 404 message', () => {
      req.method = 'POST';
      req.originalUrl = '/api/nonexistent';

      errorHandler.notFoundHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: `Can't find POST /api/nonexistent on this server!`
      });
      expect(console.error).toHaveBeenCalledWith(`Not Found: POST /api/nonexistent`);
    });
  });
});
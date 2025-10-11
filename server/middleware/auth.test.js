const authMiddleware = require('./auth');
const jwt = require('jsonwebtoken');

// Mock the jsonwebtoken module
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create mock request, response, and next function
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token and call next', () => {
      const validToken = 'valid-jwt-token';
      const decodedToken = { userId: 'user123', email: 'test@example.com' };

      req.headers = {
        'authorization': `Bearer ${validToken}`
      };

      jwt.verify.mockReturnValue(decodedToken);

      authMiddleware.authenticateToken(req, res, next);

      expect(req.user).toEqual(decodedToken);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header is missing', () => {
      authMiddleware.authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authorization token required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with Bearer', () => {
      req.headers = {
        'authorization': 'InvalidTokenFormat'
      };

      authMiddleware.authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid authorization format. Bearer token required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      const invalidToken = 'invalid-jwt-token';

      req.headers = {
        'authorization': `Bearer ${invalidToken}`
      };

      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authMiddleware.authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 500 if there is an unexpected error', () => {
      const validToken = 'valid-jwt-token';

      req.headers = {
        'authorization': `Bearer ${validToken}`
      };

      jwt.verify.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      authMiddleware.authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should authenticate valid token and call next', () => {
      const validToken = 'valid-jwt-token';
      const decodedToken = { userId: 'user123', email: 'test@example.com' };

      req.headers = {
        'authorization': `Bearer ${validToken}`
      };

      jwt.verify.mockReturnValue(decodedToken);

      authMiddleware.optionalAuth(req, res, next);

      expect(req.user).toEqual(decodedToken);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next if authorization header is missing', () => {
      authMiddleware.optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it('should call next if authorization header does not start with Bearer', () => {
      req.headers = {
        'authorization': 'InvalidTokenFormat'
      };

      authMiddleware.optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it('should call next if token is invalid but set req.user to undefined', () => {
      const invalidToken = 'invalid-jwt-token';

      req.headers = {
        'authorization': `Bearer ${invalidToken}`
      };

      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authMiddleware.optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 500 if there is an unexpected error', () => {
      const validToken = 'valid-jwt-token';

      req.headers = {
        'authorization': `Bearer ${validToken}`
      };

      jwt.verify.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      authMiddleware.optionalAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should allow access if user has required role', () => {
      const validToken = 'valid-jwt-token';
      const decodedToken = { userId: 'user123', email: 'test@example.com', role: 'admin' };
      const requiredRole = 'admin';

      req.headers = {
        'authorization': `Bearer ${validToken}`
      };

      jwt.verify.mockReturnValue(decodedToken);

      authMiddleware.requireRole(requiredRole)(req, res, next);

      expect(req.user).toEqual(decodedToken);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have required role', () => {
      const validToken = 'valid-jwt-token';
      const decodedToken = { userId: 'user123', email: 'test@example.com', role: 'listener' };
      const requiredRole = 'admin';

      req.headers = {
        'authorization': `Bearer ${validToken}`
      };

      jwt.verify.mockReturnValue(decodedToken);

      authMiddleware.requireRole(requiredRole)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header is missing', () => {
      const requiredRole = 'admin';

      authMiddleware.requireRole(requiredRole)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authorization token required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      const invalidToken = 'invalid-jwt-token';
      const requiredRole = 'admin';

      req.headers = {
        'authorization': `Bearer ${invalidToken}`
      };

      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authMiddleware.requireRole(requiredRole)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 500 if there is an unexpected error', () => {
      const validToken = 'valid-jwt-token';
      const requiredRole = 'admin';

      req.headers = {
        'authorization': `Bearer ${validToken}`
      };

      jwt.verify.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      authMiddleware.requireRole(requiredRole)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should work with multiple roles (OR condition)', () => {
      const validToken = 'valid-jwt-token';
      const decodedToken = { userId: 'user123', email: 'test@example.com', role: 'artist' };
      const requiredRoles = ['admin', 'artist'];

      req.headers = {
        'authorization': `Bearer ${validToken}`
      };

      jwt.verify.mockReturnValue(decodedToken);

      authMiddleware.requireRole(requiredRoles)(req, res, next);

      expect(req.user).toEqual(decodedToken);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should deny access if user does not have any of the required roles', () => {
      const validToken = 'valid-jwt-token';
      const decodedToken = { userId: 'user123', email: 'test@example.com', role: 'listener' };
      const requiredRoles = ['admin', 'artist'];

      req.headers = {
        'authorization': `Bearer ${validToken}`
      };

      jwt.verify.mockReturnValue(decodedToken);

      authMiddleware.requireRole(requiredRoles)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireSubscription', () => {
    it('should allow access if user has required subscription level', () => {
      const validToken = 'valid-jwt-token';
      const decodedToken = { 
        userId: 'user123', 
        email: 'test@example.com', 
        subscription: { 
          plan: 'premium', 
          status: 'active' 
        } 
      };
      const requiredLevel = 'premium';

      req.headers = {
        'authorization': `Bearer ${validToken}`
      };

      jwt.verify.mockReturnValue(decodedToken);

      authMiddleware.requireSubscription(requiredLevel)(req, res, next);

      expect(req.user).toEqual(decodedToken);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have required subscription level', () => {
      const validToken = 'valid-jwt-token';
      const decodedToken = { 
        userId: 'user123', 
        email: 'test@example.com', 
        subscription: { 
          plan: 'free', 
          status: 'active' 
        } 
      };
      const requiredLevel = 'premium';

      req.headers = {
        'authorization': `Bearer ${validToken}`
      };

      jwt.verify.mockReturnValue(decodedToken);

      authMiddleware.requireSubscription(requiredLevel)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Premium subscription required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if subscription is inactive', () => {
      const validToken = 'valid-jwt-token';
      const decodedToken = { 
        userId: 'user123', 
        email: 'test@example.com', 
        subscription: { 
          plan: 'premium', 
          status: 'cancelled' 
        } 
      };
      const requiredLevel = 'premium';

      req.headers = {
        'authorization': `Bearer ${validToken}`
      };

      jwt.verify.mockReturnValue(decodedToken);

      authMiddleware.requireSubscription(requiredLevel)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Subscription is inactive'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header is missing', () => {
      const requiredLevel = 'premium';

      authMiddleware.requireSubscription(requiredLevel)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authorization token required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      const invalidToken = 'invalid-jwt-token';
      const requiredLevel = 'premium';

      req.headers = {
        'authorization': `Bearer ${invalidToken}`
      };

      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authMiddleware.requireSubscription(requiredLevel)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 500 if there is an unexpected error', () => {
      const validToken = 'valid-jwt-token';
      const requiredLevel = 'premium';

      req.headers = {
        'authorization': `Bearer ${validToken}`
      };

      jwt.verify.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      authMiddleware.requireSubscription(requiredLevel)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should work with multiple subscription levels (OR condition)', () => {
      const validToken = 'valid-jwt-token';
      const decodedToken = { 
        userId: 'user123', 
        email: 'test@example.com', 
        subscription: { 
          plan: 'basic', 
          status: 'active' 
        } 
      };
      const requiredLevels = ['premium', 'basic'];

      req.headers = {
        'authorization': `Bearer ${validToken}`
      };

      jwt.verify.mockReturnValue(decodedToken);

      authMiddleware.requireSubscription(requiredLevels)(req, res, next);

      expect(req.user).toEqual(decodedToken);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should deny access if user does not have any of the required subscription levels', () => {
      const validToken = 'valid-jwt-token';
      const decodedToken = { 
        userId: 'user123', 
        email: 'test@example.com', 
        subscription: { 
          plan: 'free', 
          status: 'active' 
        } 
      };
      const requiredLevels = ['premium', 'basic'];

      req.headers = {
        'authorization': `Bearer ${validToken}`
      };

      jwt.verify.mockReturnValue(decodedToken);

      authMiddleware.requireSubscription(requiredLevels)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Subscription required'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('combineMiddlewares', () => {
    it('should combine multiple middlewares', () => {
      const validToken = 'valid-jwt-token';
      const decodedToken = { userId: 'user123', email: 'test@example.com', role: 'admin' };
      const requiredRole = 'admin';
      const requiredLevel = 'premium';

      req.headers = {
        'authorization': `Bearer ${validToken}`
      };

      jwt.verify.mockReturnValue(decodedToken);

      // Mock the subscription property
      decodedToken.subscription = { plan: 'premium', status: 'active' };

      const combinedMiddleware = authMiddleware.combineMiddlewares(
        authMiddleware.authenticateToken,
        authMiddleware.requireRole(requiredRole),
        authMiddleware.requireSubscription(requiredLevel)
      );

      combinedMiddleware(req, res, next);

      expect(req.user).toEqual(decodedToken);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should stop at first failing middleware', () => {
      const validToken = 'valid-jwt-token';
      const decodedToken = { userId: 'user123', email: 'test@example.com', role: 'listener' };
      const requiredRole = 'admin';

      req.headers = {
        'authorization': `Bearer ${validToken}`
      };

      jwt.verify.mockReturnValue(decodedToken);

      const combinedMiddleware = authMiddleware.combineMiddlewares(
        authMiddleware.authenticateToken,
        authMiddleware.requireRole(requiredRole)
      );

      combinedMiddleware(req, res, next);

      expect(req.user).toEqual(decodedToken);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle empty middleware array', () => {
      const combinedMiddleware = authMiddleware.combineMiddlewares();
      combinedMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../services/authService');

// Mock the environment variables
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_ACCESS_EXPIRATION = '15m';
process.env.JWT_REFRESH_EXPIRATION = '7d';

describe('Auth Service', () => {
  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const userId = 'someUserId';
      const role = 'user';
      const token = generateAccessToken(userId, role);
      
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      
      expect(decoded.userId).toBe(userId);
      expect(decoded.role).toBe(role);
      expect(decoded.exp).toBeDefined();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const userId = 'someUserId';
      const role = 'user';
      const token = generateRefreshToken(userId, role);
      
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      
      expect(decoded.userId).toBe(userId);
      expect(decoded.role).toBe(role);
      expect(decoded.exp).toBeDefined();
    });
  });
});

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const redisClient = require("../utils/redis");
const logger = require("../utils/logger");

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

const tokenService = {
  // Generate access token
  generateToken: (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  },

  // Generate refresh token
  generateRefreshToken: (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
  },

  // Generate temporary token for 2FA
  generateTempToken: (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: "5m",
    });
  },

  // Verify token
  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw error;
    }
  },

  // Verify refresh token
  verifyRefreshToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw error;
    }
  },

  // Verify temporary token
  verifyTempToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw error;
    }
  },

  // Blacklist token
  blacklistToken: async (token) => {
    try {
      const decoded = jwt.decode(token);
      if (!decoded) return false;

      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redisClient.setEx(`blacklist_${token}`, ttl, "1");
      }

      return true;
    } catch (error) {
      logger.error("Blacklist token error:", error);
      return false;
    }
  },

  // Check if token is blacklisted
  isBlacklisted: async (token) => {
    try {
      const result = await redisClient.get(`blacklist_${token}`);
      return !!result;
    } catch (error) {
      logger.error("Check blacklist error:", error);
      return false;
    }
  },

  // Save password reset token
  saveResetToken: async (userId, token) => {
    try {
      const key = `reset_${token}`;
      const ttl = 3600; // 1 hour
      await redisClient.setEx(key, ttl, userId);
      return true;
    } catch (error) {
      logger.error("Save reset token error:", error);
      return false;
    }
  },

  // Verify password reset token
  verifyResetToken: async (token) => {
    try {
      const key = `reset_${token}`;
      const userId = await redisClient.get(key);
      return userId;
    } catch (error) {
      logger.error("Verify reset token error:", error);
      return null;
    }
  },

  // Invalidate reset token
  invalidateResetToken: async (token) => {
    try {
      const key = `reset_${token}`;
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error("Invalidate reset token error:", error);
      return false;
    }
  },

  // Save email verification token
  saveVerificationToken: async (userId, token) => {
    try {
      const key = `verify_${token}`;
      const ttl = 86400; // 24 hours
      await redisClient.setEx(key, ttl, userId);
      return true;
    } catch (error) {
      logger.error("Save verification token error:", error);
      return false;
    }
  },

  // Verify email token
  verifyEmailToken: async (token) => {
    try {
      const key = `verify_${token}`;
      const userId = await redisClient.get(key);
      return userId;
    } catch (error) {
      logger.error("Verify email token error:", error);
      return null;
    }
  },

  // Invalidate email token
  invalidateEmailToken: async (token) => {
    try {
      const key = `verify_${token}`;
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error("Invalidate email token error:", error);
      return false;
    }
  },

  // Save 2FA secret temporarily
  save2FASecret: async (userId, secret) => {
    try {
      const key = `2fa_setup_${userId}`;
      const ttl = 600; // 10 minutes
      await redisClient.setEx(key, ttl, secret);
      return true;
    } catch (error) {
      logger.error("Save 2FA secret error:", error);
      return false;
    }
  },

  // Get 2FA secret
  get2FASecret: async (userId) => {
    try {
      const key = `2fa_setup_${userId}`;
      const secret = await redisClient.get(key);
      return secret;
    } catch (error) {
      logger.error("Get 2FA secret error:", error);
      return null;
    }
  },

  // Delete 2FA secret
  delete2FASecret: async (userId) => {
    try {
      const key = `2fa_setup_${userId}`;
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error("Delete 2FA secret error:", error);
      return false;
    }
  },

  // Generate secure random token
  generateSecureToken: () => {
    return crypto.randomBytes(32).toString("hex");
  },

  // Hash token for storage
  hashToken: (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
  },
};

module.exports = tokenService;

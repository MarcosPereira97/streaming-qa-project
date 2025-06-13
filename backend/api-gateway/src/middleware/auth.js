const jwt = require("jsonwebtoken");
const redisClient = require("../utils/redis");
const logger = require("../utils/logger");

const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "No token provided",
      });
    }

    const token = authHeader.substring(7);

    // Check if token is blacklisted (logout)
    const isBlacklisted = await redisClient.get(`blacklist_${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Token has been invalidated",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if session exists in cache
    const sessionKey = `session_${decoded.id}_${decoded.sessionId}`;
    const session = await redisClient.get(sessionKey);

    if (!session) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Session expired or invalid",
      });
    }

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      sessionId: decoded.sessionId,
    };

    req.token = token;

    next();
  } catch (error) {
    logger.error("Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Token expired",
      });
    }

    return res.status(500).json({
      error: "Internal Server Error",
      message: "Authentication failed",
    });
  }
};

// Optional auth middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.substring(7);

    // Check if token is blacklisted
    const isBlacklisted = await redisClient.get(`blacklist_${token}`);
    if (isBlacklisted) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if session exists
      const sessionKey = `session_${decoded.id}_${decoded.sessionId}`;
      const session = await redisClient.get(sessionKey);

      if (session) {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          username: decoded.username,
          sessionId: decoded.sessionId,
        };
        req.token = token;
      }
    } catch (error) {
      // Token is invalid, but we don't fail the request
      logger.debug("Invalid token in optional auth:", error.message);
    }

    next();
  } catch (error) {
    logger.error("Optional auth middleware error:", error);
    next();
  }
};

module.exports = authMiddleware;
module.exports.optionalAuth = optionalAuth;

const jwt = require("jsonwebtoken");
const tokenService = require("../services/tokenService");
const sessionService = require("../services/sessionService");
const logger = require("../utils/logger");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization || req.headers["x-user-id"];

    // Check if request is from API Gateway with user info
    if (req.headers["x-user-id"] && req.headers["x-user-email"]) {
      req.user = {
        id: req.headers["x-user-id"],
        email: req.headers["x-user-email"],
        username: req.headers["x-user-username"],
      };
      return next();
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "No token provided",
      });
    }

    const token = authHeader.substring(7);

    // Check if token is blacklisted
    const isBlacklisted = await tokenService.isBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Token has been invalidated",
      });
    }

    // Verify token
    const decoded = tokenService.verifyToken(token);

    // Validate session
    const isValidSession = await sessionService.validateSession(
      decoded.id,
      decoded.sessionId,
      tokenService.hashToken(token)
    );

    if (!isValidSession) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid session",
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

module.exports = authMiddleware;

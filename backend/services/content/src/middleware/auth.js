const logger = require("../utils/logger");

const authMiddleware = (req, res, next) => {
  try {
    // Get user info from API Gateway headers
    const userId = req.headers["x-user-id"];
    const userEmail = req.headers["x-user-email"];

    if (!userId || !userEmail) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    // Attach user info to request
    req.user = {
      id: userId,
      email: userEmail,
      username: req.headers["x-user-username"],
    };

    next();
  } catch (error) {
    logger.error("Auth middleware error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Authentication failed",
    });
  }
};

// Optional auth middleware - doesn't fail if no auth
authMiddleware.optional = (req, res, next) => {
  try {
    // Get user info from API Gateway headers
    const userId = req.headers["x-user-id"];
    const userEmail = req.headers["x-user-email"];

    if (userId && userEmail) {
      req.user = {
        id: userId,
        email: userEmail,
        username: req.headers["x-user-username"],
      };
    }

    next();
  } catch (error) {
    logger.error("Optional auth middleware error:", error);
    next();
  }
};

module.exports = authMiddleware;

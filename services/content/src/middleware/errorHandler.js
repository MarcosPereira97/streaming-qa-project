const logger = require("../utils/logger");

class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

const errorHandler = (err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let details = err.details || null;

  // Handle specific error types
  if (err.name === "ValidationError" || err.isJoi) {
    statusCode = 400;
    message = "Validation Error";
    details = err.details;
  } else if (err.code === "23505") {
    // PostgreSQL unique constraint violation
    statusCode = 409;
    message = "Resource already exists";
  } else if (err.code === "23503") {
    // PostgreSQL foreign key violation
    statusCode = 400;
    message = "Invalid reference";
  }

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    message = "Internal Server Error";
    details = null;
  }

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      details,
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  });
};

module.exports = errorHandler;
module.exports.ApiError = ApiError;

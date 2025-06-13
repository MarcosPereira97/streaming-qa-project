const logger = require('../utils/logger');

// Custom error class for API errors
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    user: req.user?.id
  });
  
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = err.details;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Service Unavailable';
    details = 'One or more services are currently unavailable';
  }
  
  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
    details = null;
  }
  
  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      details,
      timestamp: new Date().toISOString(),
      path: req.path
    }
  });
};

// Async error wrapper for routes
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      message: 'Resource not found',
      statusCode: 404,
      path: req.path,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = errorHandler;
module.exports.ApiError = ApiError;
module.exports.asyncHandler = asyncHandler;
module.exports.notFoundHandler = notFoundHandler;
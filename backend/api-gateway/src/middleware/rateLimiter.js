const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redisClient = require('../utils/redis');

// Create different rate limiters for different endpoints
const createRateLimiter = (options = {}) => {
  const defaults = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: 'Too Many Requests',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store: new RedisStore({
      client: redisClient,
      prefix: 'rate_limit:',
    }),
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      return req.user ? `user_${req.user.id}` : req.ip;
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    }
  };
  
  return rateLimit({ ...defaults, ...options });
};

// General API rate limiter
const generalLimiter = createRateLimiter();

// Strict rate limiter for auth endpoints
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  }
});

// Content API rate limiter (more permissive)
const contentLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    error: 'Too Many Requests',
    message: 'Too many content requests, please try again later.',
    retryAfter: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  }
});

// Search rate limiter
const searchLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: {
    error: 'Too Many Requests',
    message: 'Too many search requests, please try again later.',
    retryAfter: new Date(Date.now() + 60 * 1000).toISOString()
  }
});

// Export middleware that applies different limiters based on the route
module.exports = (req, res, next) => {
  // Apply different rate limiters based on the endpoint
  if (req.path.startsWith('/api/auth/login') || req.path.startsWith('/api/auth/register')) {
    return authLimiter(req, res, next);
  }
  
  if (req.path.startsWith('/api/search')) {
    return searchLimiter(req, res, next);
  }
  
  if (req.path.startsWith('/api/content')) {
    return contentLimiter(req, res, next);
  }
  
  // Default rate limiter for all other endpoints
  return generalLimiter(req, res, next);
};

// Export individual limiters for specific use
module.exports.authLimiter = authLimiter;
module.exports.contentLimiter = contentLimiter;
module.exports.searchLimiter = searchLimiter;
module.exports.createRateLimiter = createRateLimiter;
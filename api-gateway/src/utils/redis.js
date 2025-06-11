const { createClient } = require("redis");
const logger = require("./logger");

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error("Redis: Maximum reconnection attempts reached");
        return new Error("Maximum reconnection attempts reached");
      }
      const delay = Math.min(retries * 100, 3000);
      logger.warn(`Redis: Reconnecting in ${delay}ms...`);
      return delay;
    },
  },
});

// Error handling
redisClient.on("error", (err) => {
  logger.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  logger.info("Redis: Connecting...");
});

redisClient.on("ready", () => {
  logger.info("Redis: Connected and ready");
});

redisClient.on("end", () => {
  logger.info("Redis: Connection closed");
});

redisClient.on("reconnecting", () => {
  logger.warn("Redis: Reconnecting...");
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error("Failed to connect to Redis:", error);
    process.exit(1);
  }
})();

// Helper functions
const cache = {
  // Get data from cache
  get: async (key) => {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  // Set data in cache
  set: async (key, value, ttl = 3600) => {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  },

  // Delete from cache
  del: async (key) => {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  },

  // Clear cache by pattern
  clearPattern: async (pattern) => {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      logger.error(`Cache clear pattern error for ${pattern}:`, error);
      return false;
    }
  },
};

// Export both the client and helper functions
module.exports = redisClient;
module.exports.cache = cache;

const redisClient = require("../utils/redis");
const logger = require("../utils/logger");

const cacheService = {
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

  // Get multiple keys
  mget: async (keys) => {
    try {
      const values = await redisClient.mGet(keys);
      return values.map((value) => (value ? JSON.parse(value) : null));
    } catch (error) {
      logger.error("Cache mget error:", error);
      return keys.map(() => null);
    }
  },

  // Set multiple keys
  mset: async (items, ttl = 3600) => {
    try {
      const pipeline = redisClient.multi();

      items.forEach(({ key, value }) => {
        pipeline.setEx(key, ttl, JSON.stringify(value));
      });

      await pipeline.exec();
      return true;
    } catch (error) {
      logger.error("Cache mset error:", error);
      return false;
    }
  },

  // Increment counter
  incr: async (key, amount = 1) => {
    try {
      const result = await redisClient.incrBy(key, amount);
      return result;
    } catch (error) {
      logger.error(`Cache incr error for key ${key}:`, error);
      return null;
    }
  },

  // Check if key exists
  exists: async (key) => {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  },

  // Set expiration
  expire: async (key, ttl) => {
    try {
      await redisClient.expire(key, ttl);
      return true;
    } catch (error) {
      logger.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  },
};

module.exports = cacheService;

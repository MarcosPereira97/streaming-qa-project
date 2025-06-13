const { createClient } = require("redis");
const logger = require("./logger");

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

module.exports = redisClient;

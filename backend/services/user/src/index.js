require("dotenv").config();
require("express-async-errors");

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const { connectDB } = require("./database/connection");
const redisClient = require("./utils/redis");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined", { stream: logger.stream }));

// Health check
app.get("/health", async (req, res) => {
  try {
    // Check database connection
    const dbHealthy = await connectDB.raw("SELECT 1");

    // Check Redis connection
    const redisHealthy = await redisClient.ping();

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbHealthy ? "connected" : "disconnected",
        redis: redisHealthy === "PONG" ? "connected" : "disconnected",
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested resource was not found",
  });
});

// Error handling
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info("Received shutdown signal, closing server gracefully...");

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      await connectDB.destroy();
      logger.info("Database connections closed");

      await redisClient.quit();
      logger.info("Redis connection closed");

      process.exit(0);
    } catch (error) {
      logger.error("Error during graceful shutdown:", error);
      process.exit(1);
    }
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start server
const server = app.listen(PORT, async () => {
  try {
    // Test database connection
    await connectDB.raw("SELECT 1");
    logger.info("Database connected successfully");

    logger.info(`User Service running on port ${PORT}`);
  } catch (error) {
    logger.error("Failed to connect to database:", error);
    process.exit(1);
  }
});

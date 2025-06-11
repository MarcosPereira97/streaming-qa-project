require("dotenv").config();
require("express-async-errors");

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimiter = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const authMiddleware = require("./middleware/auth");
const logger = require("./utils/logger");
const redisClient = require("./utils/redis");

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Streaming Platform API",
      version: "1.0.0",
      description: "API Gateway for Streaming Platform Services",
      contact: {
        name: "API Support",
        email: "support@streamingplatform.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/index.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost",
    credentials: true,
  })
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined", { stream: logger.stream }));

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Rate limiting
app.use("/api/", rateLimiter);

// Service proxies
const serviceProxies = [
  {
    path: "/api/auth",
    target: process.env.USER_SERVICE_URL || "http://user-service:3001",
    pathRewrite: {
      "^/api/auth": "/auth",
    },
  },
  {
    path: "/api/users",
    target: process.env.USER_SERVICE_URL || "http://user-service:3001",
    pathRewrite: {
      "^/api/users": "/users",
    },
    protected: true,
  },
  {
    path: "/api/content",
    target: process.env.CONTENT_SERVICE_URL || "http://content-service:3002",
    pathRewrite: {
      "^/api/content": "/content",
    },
  },
  {
    path: "/api/favorites",
    target: process.env.CONTENT_SERVICE_URL || "http://content-service:3002",
    pathRewrite: {
      "^/api/favorites": "/favorites",
    },
    protected: true,
  },
  {
    path: "/api/search",
    target: process.env.CONTENT_SERVICE_URL || "http://content-service:3002",
    pathRewrite: {
      "^/api/search": "/search",
    },
  },
];

// Configure service proxies
serviceProxies.forEach(
  ({ path, target, pathRewrite, protected: isProtected }) => {
    const middlewares = [];

    if (isProtected) {
      middlewares.push(authMiddleware);
    }

    middlewares.push(
      createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite,
        onProxyReq: (proxyReq, req) => {
          // Forward user information to services
          if (req.user) {
            proxyReq.setHeader("X-User-Id", req.user.id);
            proxyReq.setHeader("X-User-Email", req.user.email);
          }
        },
        onError: (err, req, res) => {
          logger.error("Proxy error:", err);
          res.status(502).json({
            error: "Service temporarily unavailable",
            message: "Please try again later",
          });
        },
      })
    );

    app.use(path, ...middlewares);
  }
);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               username:
 *                 type: string
 *                 minLength: 3
 *               fullName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/content/movies:
 *   get:
 *     summary: Get list of movies
 *     tags: [Content]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of movies
 */

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Get user favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorite content
 *       401:
 *         description: Unauthorized
 */

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested resource was not found",
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info("Received shutdown signal, closing server gracefully...");

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
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
const server = app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info(
    `API Documentation available at http://localhost:${PORT}/api-docs`
  );
});

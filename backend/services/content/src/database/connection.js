const knex = require("knex");
const logger = require("../utils/logger");

const config = {
  client: "postgresql",
  connection: process.env.DATABASE_URL || {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "streaming_user",
    password: process.env.DB_PASSWORD || "streaming_pass",
    database: process.env.DB_NAME || "streaming_db",
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  },
  acquireConnectionTimeout: 60000,
  debug: process.env.NODE_ENV === "development",
  asyncStackTraces: process.env.NODE_ENV === "development",
};

const connectDB = knex(config);

// Test connection
connectDB
  .raw("SELECT 1")
  .then(() => {
    logger.info("Database connection established");
  })
  .catch((err) => {
    logger.error("Database connection failed:", err);
    process.exit(1);
  });

// Log queries in development
if (process.env.NODE_ENV === "development") {
  connectDB.on("query", (query) => {
    logger.debug("SQL Query:", query.sql);
  });
}

module.exports = { connectDB };

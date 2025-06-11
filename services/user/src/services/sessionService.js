const { connectDB } = require("../database/connection");
const redisClient = require("../utils/redis");
const tokenService = require("./tokenService");
const logger = require("../utils/logger");

const SESSION_TTL = 86400 * 7; // 7 days

const sessionService = {
  // Create new session
  createSession: async (sessionData) => {
    try {
      const { userId, sessionId, token, deviceInfo, ipAddress } = sessionData;

      // Store session in database
      await connectDB("user_sessions").insert({
        user_id: userId,
        token_hash: tokenService.hashToken(token),
        device_info: { userAgent: deviceInfo },
        ip_address: ipAddress,
        expires_at: new Date(Date.now() + SESSION_TTL * 1000),
      });

      // Store session in Redis for fast lookup
      const sessionKey = `session_${userId}_${sessionId}`;
      await redisClient.setEx(
        sessionKey,
        SESSION_TTL,
        JSON.stringify({
          userId,
          sessionId,
          token: tokenService.hashToken(token),
          deviceInfo,
          ipAddress,
          createdAt: new Date().toISOString(),
        })
      );

      return true;
    } catch (error) {
      logger.error("Create session error:", error);
      throw error;
    }
  },

  // Get session
  getSession: async (userId, sessionId) => {
    try {
      const sessionKey = `session_${userId}_${sessionId}`;
      const session = await redisClient.get(sessionKey);

      if (session) {
        return JSON.parse(session);
      }

      // Fallback to database if not in Redis
      const dbSession = await connectDB("user_sessions")
        .where("user_id", userId)
        .andWhere("expires_at", ">", new Date())
        .first();

      return dbSession;
    } catch (error) {
      logger.error("Get session error:", error);
      return null;
    }
  },

  // Update session
  updateSession: async (userId, sessionId, newToken) => {
    try {
      const sessionKey = `session_${userId}_${sessionId}`;
      const session = await redisClient.get(sessionKey);

      if (session) {
        const sessionData = JSON.parse(session);
        sessionData.token = tokenService.hashToken(newToken);
        sessionData.lastUsed = new Date().toISOString();

        await redisClient.setEx(
          sessionKey,
          SESSION_TTL,
          JSON.stringify(sessionData)
        );
      }

      // Update in database
      await connectDB("user_sessions")
        .where("user_id", userId)
        .andWhere("token_hash", tokenService.hashToken(newToken))
        .update({
          updated_at: new Date(),
        });

      return true;
    } catch (error) {
      logger.error("Update session error:", error);
      return false;
    }
  },

  // Get user sessions
  getUserSessions: async (userId) => {
    try {
      const sessions = await connectDB("user_sessions")
        .where("user_id", userId)
        .andWhere("expires_at", ">", new Date())
        .orderBy("created_at", "desc");

      return sessions.map((session) => ({
        sessionId: session.id,
        deviceInfo: session.device_info,
        ipAddress: session.ip_address,
        createdAt: session.created_at,
        lastUsed: session.updated_at || session.created_at,
        expiresAt: session.expires_at,
      }));
    } catch (error) {
      logger.error("Get user sessions error:", error);
      return [];
    }
  },

  // Remove session
  removeSession: async (userId, sessionId) => {
    try {
      // Remove from Redis
      const sessionKey = `session_${userId}_${sessionId}`;
      await redisClient.del(sessionKey);

      // Remove from database
      await connectDB("user_sessions")
        .where("user_id", userId)
        .andWhere("id", sessionId)
        .delete();

      return true;
    } catch (error) {
      logger.error("Remove session error:", error);
      return false;
    }
  },

  // Remove all user sessions
  removeAllSessions: async (userId) => {
    try {
      // Remove from Redis
      const keys = await redisClient.keys(`session_${userId}_*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }

      // Remove from database
      await connectDB("user_sessions").where("user_id", userId).delete();

      return true;
    } catch (error) {
      logger.error("Remove all sessions error:", error);
      return false;
    }
  },

  // Clean expired sessions
  cleanExpiredSessions: async () => {
    try {
      const deleted = await connectDB("user_sessions")
        .where("expires_at", "<", new Date())
        .delete();

      logger.info(`Cleaned ${deleted} expired sessions`);
      return deleted;
    } catch (error) {
      logger.error("Clean expired sessions error:", error);
      return 0;
    }
  },

  // Validate session
  validateSession: async (userId, sessionId, tokenHash) => {
    try {
      const session = await sessionService.getSession(userId, sessionId);

      if (!session) {
        return false;
      }

      if (session.token !== tokenHash) {
        return false;
      }

      // Update last used
      await sessionService.updateSession(userId, sessionId, tokenHash);

      return true;
    } catch (error) {
      logger.error("Validate session error:", error);
      return false;
    }
  },
};

// Schedule cleanup of expired sessions
if (process.env.NODE_ENV !== "test") {
  setInterval(() => {
    sessionService.cleanExpiredSessions().catch((error) => {
      logger.error("Session cleanup error:", error);
    });
  }, 3600000); // Run every hour
}

module.exports = sessionService;

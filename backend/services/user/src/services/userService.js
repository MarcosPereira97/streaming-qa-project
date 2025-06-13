const { connectDB } = require("../database/connection");
const logger = require("../utils/logger");

const userService = {
  // Create new user
  create: async (userData) => {
    try {
      const [user] = await connectDB("users")
        .insert({
          email: userData.email.toLowerCase(),
          username: userData.username.toLowerCase(),
          password_hash: userData.passwordHash,
          full_name: userData.fullName,
          avatar_url: userData.avatarUrl,
        })
        .returning([
          "id",
          "email",
          "username",
          "full_name",
          "avatar_url",
          "email_verified",
          "created_at",
        ]);

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
      };
    } catch (error) {
      logger.error("Create user error:", error);
      throw error;
    }
  },

  // Find user by ID
  findById: async (id, includePassword = false) => {
    try {
      const columns = [
        "id",
        "email",
        "username",
        "full_name",
        "avatar_url",
        "is_active",
        "email_verified",
        "created_at",
        "updated_at",
        "two_factor_enabled",
        "two_factor_secret",
      ];

      if (includePassword) {
        columns.push("password_hash");
      }

      const user = await connectDB("users").where("id", id).first(columns);

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        passwordHash: user.password_hash,
        twoFactorEnabled: user.two_factor_enabled,
        twoFactorSecret: user.two_factor_secret,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      logger.error("Find user by ID error:", error);
      throw error;
    }
  },

  // Find user by email
  findByEmail: async (email) => {
    try {
      const user = await connectDB("users")
        .where("email", email.toLowerCase())
        .first();

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        passwordHash: user.password_hash,
        twoFactorEnabled: user.two_factor_enabled,
        twoFactorSecret: user.two_factor_secret,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      logger.error("Find user by email error:", error);
      throw error;
    }
  },

  // Find user by username
  findByUsername: async (username) => {
    try {
      const user = await connectDB("users")
        .where("username", username.toLowerCase())
        .first(["id", "email", "username"]);

      return user;
    } catch (error) {
      logger.error("Find user by username error:", error);
      throw error;
    }
  },

  // Update user profile
  update: async (id, updateData) => {
    try {
      const updateFields = {};

      if (updateData.fullName !== undefined) {
        updateFields.full_name = updateData.fullName;
      }

      if (updateData.username !== undefined) {
        updateFields.username = updateData.username.toLowerCase();
      }

      if (updateData.avatarUrl !== undefined) {
        updateFields.avatar_url = updateData.avatarUrl;
      }

      if (updateData.email !== undefined) {
        updateFields.email = updateData.email.toLowerCase();
        updateFields.email_verified = false;
      }

      const [user] = await connectDB("users")
        .where("id", id)
        .update(updateFields)
        .returning([
          "id",
          "email",
          "username",
          "full_name",
          "avatar_url",
          "email_verified",
        ]);

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        emailVerified: user.email_verified,
      };
    } catch (error) {
      logger.error("Update user error:", error);
      throw error;
    }
  },

  // Update password
  updatePassword: async (id, passwordHash) => {
    try {
      await connectDB("users")
        .where("id", id)
        .update({ password_hash: passwordHash });

      return true;
    } catch (error) {
      logger.error("Update password error:", error);
      throw error;
    }
  },

  // Update last login
  updateLastLogin: async (id) => {
    try {
      await connectDB("users")
        .where("id", id)
        .update({ last_login_at: connectDB.fn.now() });

      return true;
    } catch (error) {
      logger.error("Update last login error:", error);
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (id) => {
    try {
      await connectDB("users").where("id", id).update({ email_verified: true });

      return true;
    } catch (error) {
      logger.error("Verify email error:", error);
      throw error;
    }
  },

  // Enable 2FA
  enable2FA: async (id, secret) => {
    try {
      await connectDB("users").where("id", id).update({
        two_factor_enabled: true,
        two_factor_secret: secret,
      });

      return true;
    } catch (error) {
      logger.error("Enable 2FA error:", error);
      throw error;
    }
  },

  // Disable 2FA
  disable2FA: async (id) => {
    try {
      await connectDB("users").where("id", id).update({
        two_factor_enabled: false,
        two_factor_secret: null,
      });

      return true;
    } catch (error) {
      logger.error("Disable 2FA error:", error);
      throw error;
    }
  },

  // Deactivate user
  deactivate: async (id) => {
    try {
      await connectDB("users").where("id", id).update({ is_active: false });

      return true;
    } catch (error) {
      logger.error("Deactivate user error:", error);
      throw error;
    }
  },

  // Reactivate user
  reactivate: async (id) => {
    try {
      await connectDB("users").where("id", id).update({ is_active: true });

      return true;
    } catch (error) {
      logger.error("Reactivate user error:", error);
      throw error;
    }
  },

  // Delete user (soft delete)
  delete: async (id) => {
    try {
      await connectDB("users").where("id", id).update({
        is_active: false,
        deleted_at: connectDB.fn.now(),
      });

      return true;
    } catch (error) {
      logger.error("Delete user error:", error);
      throw error;
    }
  },

  // Get user statistics
  getUserStats: async (id) => {
    try {
      const favoriteCount = await connectDB("favorites")
        .where("user_id", id)
        .count("id as count")
        .first();

      const watchHistory = await connectDB("watch_history")
        .where("user_id", id)
        .select(
          connectDB.raw("COUNT(DISTINCT content_id) as unique_watched"),
          connectDB.raw(
            "SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed_count"
          ),
          connectDB.raw("SUM(progress) as total_watch_time")
        )
        .first();

      return {
        favoriteCount: parseInt(favoriteCount.count),
        uniqueWatched: parseInt(watchHistory.unique_watched),
        completedCount: parseInt(watchHistory.completed_count),
        totalWatchTime: parseInt(watchHistory.total_watch_time || 0),
      };
    } catch (error) {
      logger.error("Get user stats error:", error);
      throw error;
    }
  },
};

module.exports = userService;

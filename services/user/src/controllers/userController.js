const bcrypt = require("bcryptjs");
const userService = require("../services/userService");
const emailService = require("../services/emailService");
const sessionService = require("../services/sessionService");
const logger = require("../utils/logger");
const { ApiError } = require("../middleware/errorHandler");

const userController = {
  // Get current user
  getCurrentUser: async (req, res) => {
    try {
      const user = await userService.findById(req.user.id);

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      // Remove sensitive data
      delete user.passwordHash;
      delete user.twoFactorSecret;

      res.json(user);
    } catch (error) {
      logger.error("Get current user error:", error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { username, fullName, avatarUrl } = req.body;

      // Check if username is taken
      if (username) {
        const existingUser = await userService.findByUsername(username);
        if (existingUser && existingUser.id !== req.user.id) {
          throw new ApiError(409, "Username already taken");
        }
      }

      const updatedUser = await userService.update(req.user.id, {
        username,
        fullName,
        avatarUrl,
      });

      res.json(updatedUser);
    } catch (error) {
      logger.error("Update profile error:", error);
      throw error;
    }
  },

  // Update email
  updateEmail: async (req, res) => {
    try {
      const { newEmail, password } = req.body;

      // Verify password
      const user = await userService.findById(req.user.id);
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        throw new ApiError(401, "Invalid password");
      }

      // Check if email is taken
      const existingUser = await userService.findByEmail(newEmail);
      if (existingUser) {
        throw new ApiError(409, "Email already in use");
      }

      // Update email
      const updatedUser = await userService.update(req.user.id, {
        email: newEmail,
      });

      // Send verification email to new address
      const verificationToken = crypto.randomBytes(32).toString("hex");
      await tokenService.saveVerificationToken(user.id, verificationToken);
      await emailService.sendVerificationEmail(newEmail, verificationToken);

      res.json({
        message: "Email updated. Please verify your new email address.",
        user: updatedUser,
      });
    } catch (error) {
      logger.error("Update email error:", error);
      throw error;
    }
  },

  // Get user statistics
  getUserStats: async (req, res) => {
    try {
      const stats = await userService.getUserStats(req.user.id);

      res.json(stats);
    } catch (error) {
      logger.error("Get user stats error:", error);
      throw error;
    }
  },

  // Upload avatar
  uploadAvatar: async (req, res) => {
    try {
      // In a real implementation, you would:
      // 1. Use multer to handle file upload
      // 2. Validate file type and size
      // 3. Upload to S3 or cloud storage
      // 4. Save the URL to database

      throw new ApiError(501, "Avatar upload not implemented");
    } catch (error) {
      logger.error("Upload avatar error:", error);
      throw error;
    }
  },

  // Delete account
  deleteAccount: async (req, res) => {
    try {
      // Soft delete the user
      await userService.delete(req.user.id);

      // Logout from all sessions
      await sessionService.removeAllSessions(req.user.id);

      // Send goodbye email
      const user = await userService.findById(req.user.id);
      await emailService.sendAccountDeactivationEmail(
        user.email,
        user.username
      );

      res.json({
        message: "Account deleted successfully",
      });
    } catch (error) {
      logger.error("Delete account error:", error);
      throw error;
    }
  },
};

module.exports = userController;

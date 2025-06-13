const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const crypto = require("crypto");

const userService = require("../services/userService");
const emailService = require("../services/emailService");
const tokenService = require("../services/tokenService");
const sessionService = require("../services/sessionService");
const logger = require("../utils/logger");
const { ApiError } = require("../middleware/errorHandler");

const authController = {
  // Register new user
  register: async (req, res) => {
    const { email, password, username, fullName } = req.body;

    try {
      // Check if user already exists
      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        throw new ApiError(409, "User already exists with this email");
      }

      const existingUsername = await userService.findByUsername(username);
      if (existingUsername) {
        throw new ApiError(409, "Username already taken");
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const user = await userService.create({
        email,
        username,
        passwordHash,
        fullName,
      });

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      await tokenService.saveVerificationToken(user.id, verificationToken);

      // Send verification email
      await emailService.sendVerificationEmail(user.email, verificationToken);

      // Generate JWT
      const sessionId = uuidv4();
      const token = tokenService.generateToken({
        id: user.id,
        email: user.email,
        username: user.username,
        sessionId,
      });

      // Save session
      await sessionService.createSession({
        userId: user.id,
        sessionId,
        token,
        deviceInfo: req.headers["user-agent"],
        ipAddress: req.ip,
      });

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          emailVerified: user.emailVerified,
        },
        token,
      });
    } catch (error) {
      logger.error("Registration error:", error);
      throw error;
    }
  },

  // Login user
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Find user
      const user = await userService.findByEmail(email);
      if (!user) {
        throw new ApiError(401, "Invalid credentials");
      }

      // Check if user is active
      if (!user.isActive) {
        throw new ApiError(403, "Account is deactivated");
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw new ApiError(401, "Invalid credentials");
      }

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        // Generate temporary token for 2FA
        const tempToken = tokenService.generateTempToken({
          id: user.id,
          email: user.email,
          requires2FA: true,
        });

        return res.json({
          message: "Two-factor authentication required",
          requires2FA: true,
          tempToken,
        });
      }

      // Generate JWT
      const sessionId = uuidv4();
      const token = tokenService.generateToken({
        id: user.id,
        email: user.email,
        username: user.username,
        sessionId,
      });

      // Save session
      await sessionService.createSession({
        userId: user.id,
        sessionId,
        token,
        deviceInfo: req.headers["user-agent"],
        ipAddress: req.ip,
      });

      // Update last login
      await userService.updateLastLogin(user.id);

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          emailVerified: user.emailVerified,
        },
        token,
      });
    } catch (error) {
      logger.error("Login error:", error);
      throw error;
    }
  },

  // Logout user
  logout: async (req, res) => {
    try {
      const { token, user } = req;

      // Blacklist token
      await tokenService.blacklistToken(token);

      // Remove session
      await sessionService.removeSession(user.id, user.sessionId);

      res.json({
        message: "Logout successful",
      });
    } catch (error) {
      logger.error("Logout error:", error);
      throw error;
    }
  },

  // Logout from all devices
  logoutAll: async (req, res) => {
    try {
      const { user } = req;

      // Get all sessions
      const sessions = await sessionService.getUserSessions(user.id);

      // Blacklist all tokens
      for (const session of sessions) {
        await tokenService.blacklistToken(session.token);
      }

      // Remove all sessions
      await sessionService.removeAllSessions(user.id);

      res.json({
        message: "Logged out from all devices",
      });
    } catch (error) {
      logger.error("Logout all error:", error);
      throw error;
    }
  },

  // Refresh token
  refreshToken: async (req, res) => {
    const { refreshToken } = req.body;

    try {
      // Verify refresh token
      const decoded = tokenService.verifyRefreshToken(refreshToken);

      // Check if session exists
      const session = await sessionService.getSession(
        decoded.id,
        decoded.sessionId
      );
      if (!session) {
        throw new ApiError(401, "Invalid refresh token");
      }

      // Generate new access token
      const newToken = tokenService.generateToken({
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
        sessionId: decoded.sessionId,
      });

      // Update session
      await sessionService.updateSession(
        decoded.id,
        decoded.sessionId,
        newToken
      );

      res.json({
        token: newToken,
      });
    } catch (error) {
      logger.error("Refresh token error:", error);
      throw new ApiError(401, "Invalid refresh token");
    }
  },

  // Change password
  changePassword: async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const { user } = req;

    try {
      // Get user with password
      const fullUser = await userService.findById(user.id);

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        fullUser.passwordHash
      );
      if (!isValidPassword) {
        throw new ApiError(401, "Current password is incorrect");
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      // Update password
      await userService.updatePassword(user.id, passwordHash);

      // Logout from all devices except current
      const sessions = await sessionService.getUserSessions(user.id);
      for (const session of sessions) {
        if (session.sessionId !== user.sessionId) {
          await tokenService.blacklistToken(session.token);
          await sessionService.removeSession(user.id, session.sessionId);
        }
      }

      res.json({
        message: "Password changed successfully",
      });
    } catch (error) {
      logger.error("Change password error:", error);
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (req, res) => {
    const { email } = req.body;

    try {
      // Find user
      const user = await userService.findByEmail(email);
      if (!user) {
        // Don't reveal if user exists
        return res.json({
          message: "If the email exists, a reset link has been sent",
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      await tokenService.saveResetToken(user.id, resetToken);

      // Send reset email
      await emailService.sendPasswordResetEmail(user.email, resetToken);

      res.json({
        message: "If the email exists, a reset link has been sent",
      });
    } catch (error) {
      logger.error("Forgot password error:", error);
      res.json({
        message: "If the email exists, a reset link has been sent",
      });
    }
  },

  // Reset password
  resetPassword: async (req, res) => {
    const { token, newPassword } = req.body;

    try {
      // Verify reset token
      const userId = await tokenService.verifyResetToken(token);
      if (!userId) {
        throw new ApiError(400, "Invalid or expired reset token");
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      // Update password
      await userService.updatePassword(userId, passwordHash);

      // Invalidate reset token
      await tokenService.invalidateResetToken(token);

      // Logout from all devices
      const sessions = await sessionService.getUserSessions(userId);
      for (const session of sessions) {
        await tokenService.blacklistToken(session.token);
      }
      await sessionService.removeAllSessions(userId);

      res.json({
        message: "Password reset successfully",
      });
    } catch (error) {
      logger.error("Reset password error:", error);
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (req, res) => {
    const { token } = req.body;

    try {
      // Verify token
      const userId = await tokenService.verifyEmailToken(token);
      if (!userId) {
        throw new ApiError(400, "Invalid or expired verification token");
      }

      // Update user
      await userService.verifyEmail(userId);

      // Invalidate token
      await tokenService.invalidateEmailToken(token);

      res.json({
        message: "Email verified successfully",
      });
    } catch (error) {
      logger.error("Verify email error:", error);
      throw error;
    }
  },

  // Get user sessions
  getSessions: async (req, res) => {
    const { user } = req;

    try {
      const sessions = await sessionService.getUserSessions(user.id);

      res.json({
        sessions: sessions.map((session) => ({
          id: session.sessionId,
          deviceInfo: session.deviceInfo,
          ipAddress: session.ipAddress,
          createdAt: session.createdAt,
          lastUsed: session.lastUsed,
          current: session.sessionId === user.sessionId,
        })),
      });
    } catch (error) {
      logger.error("Get sessions error:", error);
      throw error;
    }
  },

  // Remove specific session
  removeSession: async (req, res) => {
    const { user } = req;
    const { sessionId } = req.params;

    try {
      // Get session
      const session = await sessionService.getSession(user.id, sessionId);
      if (!session) {
        throw new ApiError(404, "Session not found");
      }

      // Can't remove current session
      if (sessionId === user.sessionId) {
        throw new ApiError(400, "Cannot remove current session");
      }

      // Blacklist token and remove session
      await tokenService.blacklistToken(session.token);
      await sessionService.removeSession(user.id, sessionId);

      res.json({
        message: "Session removed successfully",
      });
    } catch (error) {
      logger.error("Remove session error:", error);
      throw error;
    }
  },

  // Enable 2FA
  enable2FA: async (req, res) => {
    const { user } = req;

    try {
      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `StreamingApp (${user.email})`,
        length: 32,
      });

      // Save secret temporarily
      await tokenService.save2FASecret(user.id, secret.base32);

      // Generate QR code
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

      res.json({
        secret: secret.base32,
        qrCode: qrCodeUrl,
        message: "Scan the QR code with your authenticator app",
      });
    } catch (error) {
      logger.error("Enable 2FA error:", error);
      throw error;
    }
  },

  // Verify 2FA
  verify2FA: async (req, res) => {
    const { code, tempToken } = req.body;

    try {
      let userId;
      let isSetup = false;

      // Check if this is setup or login
      if (tempToken) {
        // This is login with 2FA
        const decoded = tokenService.verifyTempToken(tempToken);
        userId = decoded.id;
      } else {
        // This is 2FA setup
        userId = req.user.id;
        isSetup = true;
      }

      // Get user
      const user = await userService.findById(userId);

      // Get secret
      let secret;
      if (isSetup) {
        secret = await tokenService.get2FASecret(userId);
      } else {
        secret = user.twoFactorSecret;
      }

      if (!secret) {
        throw new ApiError(400, "Two-factor authentication not set up");
      }

      // Verify code
      const verified = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token: code,
        window: 2,
      });

      if (!verified) {
        throw new ApiError(401, "Invalid authentication code");
      }

      if (isSetup) {
        // Complete 2FA setup
        await userService.enable2FA(userId, secret);
        await tokenService.delete2FASecret(userId);

        res.json({
          message: "Two-factor authentication enabled successfully",
        });
      } else {
        // Complete login
        const sessionId = uuidv4();
        const token = tokenService.generateToken({
          id: user.id,
          email: user.email,
          username: user.username,
          sessionId,
        });

        // Save session
        await sessionService.createSession({
          userId: user.id,
          sessionId,
          token,
          deviceInfo: req.headers["user-agent"],
          ipAddress: req.ip,
        });

        res.json({
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
          },
          token,
        });
      }
    } catch (error) {
      logger.error("Verify 2FA error:", error);
      throw error;
    }
  },

  // Disable 2FA
  disable2FA: async (req, res) => {
    const { user } = req;
    const { code } = req.body;

    try {
      // Get user with secret
      const fullUser = await userService.findById(user.id);

      if (!fullUser.twoFactorEnabled) {
        throw new ApiError(400, "Two-factor authentication not enabled");
      }

      // Verify code
      const verified = speakeasy.totp.verify({
        secret: fullUser.twoFactorSecret,
        encoding: "base32",
        token: code,
        window: 2,
      });

      if (!verified) {
        throw new ApiError(401, "Invalid authentication code");
      }

      // Disable 2FA
      await userService.disable2FA(user.id);

      res.json({
        message: "Two-factor authentication disabled successfully",
      });
    } catch (error) {
      logger.error("Disable 2FA error:", error);
      throw error;
    }
  },
};

module.exports = authController;

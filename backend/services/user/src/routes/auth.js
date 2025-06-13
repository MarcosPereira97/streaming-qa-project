const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");
const { authSchemas } = require("../validators/authValidators");

// Public routes
router.post(
  "/register",
  validate(authSchemas.register),
  authController.register
);

router.post("/login", validate(authSchemas.login), authController.login);

router.post(
  "/refresh-token",
  validate(authSchemas.refreshToken),
  authController.refreshToken
);

router.post(
  "/forgot-password",
  validate(authSchemas.forgotPassword),
  authController.forgotPassword
);

router.post(
  "/reset-password",
  validate(authSchemas.resetPassword),
  authController.resetPassword
);

router.post(
  "/verify-email",
  validate(authSchemas.verifyEmail),
  authController.verifyEmail
);

// Protected routes
router.post("/logout", authMiddleware, authController.logout);

router.post("/logout-all", authMiddleware, authController.logoutAll);

router.post(
  "/change-password",
  authMiddleware,
  validate(authSchemas.changePassword),
  authController.changePassword
);

router.get("/sessions", authMiddleware, authController.getSessions);

router.delete(
  "/sessions/:sessionId",
  authMiddleware,
  authController.removeSession
);

// Two-factor authentication
router.post("/2fa/enable", authMiddleware, authController.enable2FA);

router.post(
  "/2fa/verify",
  authMiddleware,
  validate(authSchemas.verify2FA),
  authController.verify2FA
);

router.post(
  "/2fa/disable",
  authMiddleware,
  validate(authSchemas.disable2FA),
  authController.disable2FA
);

module.exports = router;

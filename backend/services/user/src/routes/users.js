const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");
const { userSchemas } = require("../validators/authValidators");

// All routes require authentication
router.use(authMiddleware);

// Get current user
router.get("/me", userController.getCurrentUser);

// Update user profile
router.put(
  "/profile",
  validate(userSchemas.updateProfile),
  userController.updateProfile
);

// Update email
router.put(
  "/email",
  validate(userSchemas.updateEmail),
  userController.updateEmail
);

// Get user statistics
router.get("/stats", userController.getUserStats);

// Upload avatar (placeholder - implement with multer/S3)
router.post("/avatar", userController.uploadAvatar);

// Delete account
router.delete("/account", userController.deleteAccount);

module.exports = router;

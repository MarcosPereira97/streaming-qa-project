const express = require("express");
const router = express.Router();
const favoritesController = require("../controllers/favoritesController");
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");
const { favoritesSchemas } = require("../validators/contentValidators");

// All favorites routes require authentication
router.use(authMiddleware);

// Get user favorites
router.get(
  "/",
  validate(favoritesSchemas.getFavorites, "query"),
  favoritesController.getFavorites
);

// Add to favorites
router.post(
  "/",
  validate(favoritesSchemas.addFavorite),
  favoritesController.addFavorite
);

// Remove from favorites
router.delete(
  "/:contentId",
  validate(favoritesSchemas.removeFavorite, "params"),
  validate(favoritesSchemas.removeFavoriteBody, "query"),
  favoritesController.removeFavorite
);

// Check if content is favorited
router.get(
  "/check/:contentId",
  validate(favoritesSchemas.checkFavorite, "params"),
  validate(favoritesSchemas.checkFavoriteQuery, "query"),
  favoritesController.checkFavorite
);

// Get favorite statistics
router.get("/stats", favoritesController.getFavoriteStats);

module.exports = router;

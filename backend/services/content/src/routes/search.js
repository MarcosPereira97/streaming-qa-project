const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");
const { searchSchemas } = require("../validators/contentValidators");

// Search content
router.get(
  "/",
  authMiddleware.optional,
  validate(searchSchemas.search, "query"),
  searchController.search
);

// Get search suggestions
router.get(
  "/suggestions",
  validate(searchSchemas.suggestions, "query"),
  searchController.getSuggestions
);

// Get popular searches
router.get("/popular", searchController.getPopularSearches);

// Advanced search
router.post(
  "/advanced",
  authMiddleware.optional,
  validate(searchSchemas.advancedSearch),
  searchController.advancedSearch
);

module.exports = router;

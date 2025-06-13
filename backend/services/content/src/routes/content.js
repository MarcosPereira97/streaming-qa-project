const express = require("express");
const router = express.Router();
const contentController = require("../controllers/contentController");
const authMiddleware = require("../middleware/auth");
const validate = require("../middleware/validate");
const { contentSchemas } = require("../validators/contentValidators");

// Public routes
router.get(
  "/movies",
  validate(contentSchemas.getContent, "query"),
  contentController.getMovies
);

router.get(
  "/movies/:id",
  validate(contentSchemas.contentId, "params"),
  contentController.getMovieById
);

router.get(
  "/series",
  validate(contentSchemas.getContent, "query"),
  contentController.getSeries
);

router.get(
  "/series/:id",
  validate(contentSchemas.contentId, "params"),
  contentController.getSeriesById
);

router.get(
  "/trending",
  validate(contentSchemas.getTrending, "query"),
  contentController.getTrending
);

router.get("/genres", contentController.getGenres);

router.get(
  "/recommendations",
  authMiddleware.optional,
  validate(contentSchemas.getRecommendations, "query"),
  contentController.getRecommendations
);

// Protected routes
router.post(
  "/watch-history",
  authMiddleware,
  validate(contentSchemas.updateWatchHistory),
  contentController.updateWatchHistory
);

router.get(
  "/watch-history",
  authMiddleware,
  validate(contentSchemas.getWatchHistory, "query"),
  contentController.getWatchHistory
);

router.get(
  "/continue-watching",
  authMiddleware,
  contentController.getContinueWatching
);

module.exports = router;

const contentService = require("../services/contentService");
const watchHistoryService = require("../services/watchHistoryService");
const recommendationService = require("../services/recommendationService");
const cacheService = require("../services/cacheService");
const logger = require("../utils/logger");
const { ApiError } = require("../middleware/errorHandler");

const contentController = {
  // Get movies with pagination and filters
  getMovies: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        genre,
        year,
        sortBy = "popularity",
        order = "desc",
      } = req.query;

      // Try to get from cache
      const cacheKey = `movies:${page}:${limit}:${genre}:${year}:${sortBy}:${order}`;
      const cached = await cacheService.get(cacheKey);

      if (cached) {
        return res.json(cached);
      }

      // Get movies from database
      const result = await contentService.getMovies({
        page: parseInt(page),
        limit: parseInt(limit),
        genre,
        year: year ? parseInt(year) : undefined,
        sortBy,
        order,
      });

      // Cache for 5 minutes
      await cacheService.set(cacheKey, result, 300);

      res.json(result);
    } catch (error) {
      logger.error("Get movies error:", error);
      throw error;
    }
  },

  // Get movie by ID
  getMovieById: async (req, res) => {
    try {
      const { id } = req.params;

      // Try to get from cache
      const cacheKey = `movie:${id}`;
      const cached = await cacheService.get(cacheKey);

      if (cached) {
        return res.json(cached);
      }

      // Get movie from database
      const movie = await contentService.getMovieById(id);

      if (!movie) {
        throw new ApiError(404, "Movie not found");
      }

      // Get similar movies
      const similar = await contentService.getSimilarContent(id, "movie");

      const result = {
        ...movie,
        similar,
      };

      // Cache for 1 hour
      await cacheService.set(cacheKey, result, 3600);

      res.json(result);
    } catch (error) {
      logger.error("Get movie by ID error:", error);
      throw error;
    }
  },

  // Get series with pagination and filters
  getSeries: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        genre,
        year,
        status,
        sortBy = "popularity",
        order = "desc",
      } = req.query;

      // Try to get from cache
      const cacheKey = `series:${page}:${limit}:${genre}:${year}:${status}:${sortBy}:${order}`;
      const cached = await cacheService.get(cacheKey);

      if (cached) {
        return res.json(cached);
      }

      // Get series from database
      const result = await contentService.getSeries({
        page: parseInt(page),
        limit: parseInt(limit),
        genre,
        year: year ? parseInt(year) : undefined,
        status,
        sortBy,
        order,
      });

      // Cache for 5 minutes
      await cacheService.set(cacheKey, result, 300);

      res.json(result);
    } catch (error) {
      logger.error("Get series error:", error);
      throw error;
    }
  },

  // Get series by ID
  getSeriesById: async (req, res) => {
    try {
      const { id } = req.params;

      // Try to get from cache
      const cacheKey = `series:${id}`;
      const cached = await cacheService.get(cacheKey);

      if (cached) {
        return res.json(cached);
      }

      // Get series from database
      const series = await contentService.getSeriesById(id);

      if (!series) {
        throw new ApiError(404, "Series not found");
      }

      // Get similar series
      const similar = await contentService.getSimilarContent(id, "series");

      const result = {
        ...series,
        similar,
      };

      // Cache for 1 hour
      await cacheService.set(cacheKey, result, 3600);

      res.json(result);
    } catch (error) {
      logger.error("Get series by ID error:", error);
      throw error;
    }
  },

  // Get trending content
  getTrending: async (req, res) => {
    try {
      const { type = "all", timeWindow = "week" } = req.query;

      // Try to get from cache
      const cacheKey = `trending:${type}:${timeWindow}`;
      const cached = await cacheService.get(cacheKey);

      if (cached) {
        return res.json(cached);
      }

      // Get trending content
      const result = await contentService.getTrending(type, timeWindow);

      // Cache for 30 minutes
      await cacheService.set(cacheKey, result, 1800);

      res.json(result);
    } catch (error) {
      logger.error("Get trending error:", error);
      throw error;
    }
  },

  // Get all genres
  getGenres: async (req, res) => {
    try {
      // Try to get from cache
      const cached = await cacheService.get("genres");

      if (cached) {
        return res.json(cached);
      }

      // Get genres
      const genres = await contentService.getGenres();

      // Cache for 24 hours
      await cacheService.set("genres", genres, 86400);

      res.json(genres);
    } catch (error) {
      logger.error("Get genres error:", error);
      throw error;
    }
  },

  // Get recommendations
  getRecommendations: async (req, res) => {
    try {
      const { type = "all", limit = 20 } = req.query;
      const userId = req.user?.id;

      let recommendations;

      if (userId) {
        // Get personalized recommendations
        recommendations =
          await recommendationService.getPersonalizedRecommendations(
            userId,
            type,
            parseInt(limit)
          );
      } else {
        // Get general recommendations
        recommendations = await recommendationService.getGeneralRecommendations(
          type,
          parseInt(limit)
        );
      }

      res.json(recommendations);
    } catch (error) {
      logger.error("Get recommendations error:", error);
      throw error;
    }
  },

  // Update watch history
  updateWatchHistory: async (req, res) => {
    try {
      const { contentId, contentType, progress, totalDuration } = req.body;
      const userId = req.user.id;

      const watchHistory = await watchHistoryService.updateProgress({
        userId,
        contentId,
        contentType,
        progress,
        totalDuration,
      });

      res.json({
        message: "Watch history updated",
        watchHistory,
      });
    } catch (error) {
      logger.error("Update watch history error:", error);
      throw error;
    }
  },

  // Get watch history
  getWatchHistory: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const userId = req.user.id;

      const history = await watchHistoryService.getUserHistory(
        userId,
        parseInt(page),
        parseInt(limit)
      );

      res.json(history);
    } catch (error) {
      logger.error("Get watch history error:", error);
      throw error;
    }
  },

  // Get continue watching
  getContinueWatching: async (req, res) => {
    try {
      const userId = req.user.id;

      // Try to get from cache
      const cacheKey = `continue-watching:${userId}`;
      const cached = await cacheService.get(cacheKey);

      if (cached) {
        return res.json(cached);
      }

      const continueWatching = await watchHistoryService.getContinueWatching(
        userId
      );

      // Cache for 5 minutes
      await cacheService.set(cacheKey, continueWatching, 300);

      res.json(continueWatching);
    } catch (error) {
      logger.error("Get continue watching error:", error);
      throw error;
    }
  },
};

module.exports = contentController;

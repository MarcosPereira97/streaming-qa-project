const favoritesService = require('../services/favoritesService');
const contentService = require('../services/contentService');
const cacheService = require('../services/cacheService');
const logger = require('../utils/logger');
const { ApiError } = require('../middleware/errorHandler');

const favoritesController = {
  // Get user favorites
  getFavorites: async (req, res) => {
    try {
      const { page = 1, limit = 20, type } = req.query;
      const userId = req.user.id;
      
      const favorites = await favoritesService.getUserFavorites(
        userId,
        {
          page: parseInt(page),
          limit: parseInt(limit),
          type
        }
      );
      
      res.json(favorites);
    } catch (error) {
      logger.error('Get favorites error:', error);
      throw error;
    }
  },
  
  // Add to favorites
  addFavorite: async (req, res) => {
    try {
      const { contentId, contentType } = req.body;
      const userId = req.user.id;
      
      // Verify content exists
      let content;
      if (contentType === 'movie') {
        content = await contentService.getMovieById(contentId);
      } else if (contentType === 'series') {
        content = await contentService.getSeriesById(contentId);
      } else {
        throw new ApiError(400, 'Invalid content type');
      }
      
      if (!content) {
        throw new ApiError(404, 'Content not found');
      }
      
      // Check if already favorited
      const exists = await favoritesService.checkFavorite(userId, contentId, contentType);
      if (exists) {
        throw new ApiError(409, 'Content already in favorites');
      }
      
      // Add to favorites
      const favorite = await favoritesService.addFavorite(userId, contentId, contentType);
      
      // Clear cache
      await cacheService.clearPattern(`favorites:${userId}:*`);
      
      res.status(201).json({
        message: 'Added to favorites',
        favorite
      });
    } catch (error) {
      logger.error('Add favorite error:', error);
      throw error;
    }
  },
  
  // Remove from favorites
  removeFavorite: async (req, res) => {
    try {
      const { contentId } = req.params;
      const { contentType } = req.query;
      const userId = req.user.id;
      
      // Check if favorited
      const exists = await favoritesService.checkFavorite(userId, contentId, contentType);
      if (!exists) {
        throw new ApiError(404, 'Content not in favorites');
      }
      
      // Remove from favorites
      await favoritesService.removeFavorite(userId, contentId, contentType);
      
      // Clear cache
      await cacheService.clearPattern(`favorites:${userId}:*`);
      
      res.json({
        message: 'Removed from favorites'
      });
    } catch (error) {
      logger.error('Remove favorite error:', error);
      throw error;
    }
  },
  
  // Check if content is favorited
  checkFavorite: async (req, res) => {
    try {
      const { contentId } = req.params;
      const { contentType } = req.query;
      const userId = req.user.id;
      
      const isFavorited = await favoritesService.checkFavorite(userId, contentId, contentType);
      
      res.json({
        isFavorited
      });
    } catch (error) {
      logger.error('Check favorite error:', error);
      throw error;
    }
  },
  
  // Get favorite statistics
  getFavoriteStats: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Try to get from cache
      const cacheKey = `favorite-stats:${userId}`;
      const cached = await cacheService.get(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }
      
      const stats = await favoritesService.getUserFavoriteStats(userId);
      
      // Cache for 10 minutes
      await cacheService.set(cacheKey, stats, 600);
      
      res.json(stats);
    } catch (error) {
      logger.error('Get favorite stats error:', error);
      throw error;
    }
  }
};

module.exports = favoritesController;
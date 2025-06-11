const searchService = require("../services/searchService");
const cacheService = require("../services/cacheService");
const logger = require("../utils/logger");

const searchController = {
  // Search content
  search: async (req, res) => {
    try {
      const { q, type = "all", page = 1, limit = 20 } = req.query;
      const userId = req.user?.id;

      if (!q || q.trim().length < 2) {
        return res.json({
          results: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
        });
      }

      // Try to get from cache
      const cacheKey = `search:${q}:${type}:${page}:${limit}`;
      const cached = await cacheService.get(cacheKey);

      if (cached) {
        // Record search for analytics
        if (userId) {
          searchService
            .recordSearch(userId, q)
            .catch((err) => logger.error("Record search error:", err));
        }
        return res.json(cached);
      }

      // Perform search
      const results = await searchService.searchContent({
        query: q,
        type,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      // Cache for 10 minutes
      await cacheService.set(cacheKey, results, 600);

      // Record search for analytics
      if (userId) {
        searchService
          .recordSearch(userId, q)
          .catch((err) => logger.error("Record search error:", err));
      }

      res.json(results);
    } catch (error) {
      logger.error("Search error:", error);
      throw error;
    }
  },

  // Get search suggestions
  getSuggestions: async (req, res) => {
    try {
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return res.json([]);
      }

      // Try to get from cache
      const cacheKey = `suggestions:${q}`;
      const cached = await cacheService.get(cacheKey);

      if (cached) {
        return res.json(cached);
      }

      const suggestions = await searchService.getSuggestions(q);

      // Cache for 30 minutes
      await cacheService.set(cacheKey, suggestions, 1800);

      res.json(suggestions);
    } catch (error) {
      logger.error("Get suggestions error:", error);
      throw error;
    }
  },

  // Get popular searches
  getPopularSearches: async (req, res) => {
    try {
      // Try to get from cache
      const cached = await cacheService.get("popular-searches");

      if (cached) {
        return res.json(cached);
      }

      const popularSearches = await searchService.getPopularSearches();

      // Cache for 1 hour
      await cacheService.set("popular-searches", popularSearches, 3600);

      res.json(popularSearches);
    } catch (error) {
      logger.error("Get popular searches error:", error);
      throw error;
    }
  },

  // Advanced search
  advancedSearch: async (req, res) => {
    try {
      const {
        query,
        type,
        genres,
        yearFrom,
        yearTo,
        ratingMin,
        ratingMax,
        sortBy = "relevance",
        page = 1,
        limit = 20,
      } = req.body;

      const results = await searchService.advancedSearch({
        query,
        type,
        genres,
        yearFrom,
        yearTo,
        ratingMin,
        ratingMax,
        sortBy,
        page: parseInt(page),
        limit: parseInt(limit),
      });

      res.json(results);
    } catch (error) {
      logger.error("Advanced search error:", error);
      throw error;
    }
  },
};

module.exports = searchController;

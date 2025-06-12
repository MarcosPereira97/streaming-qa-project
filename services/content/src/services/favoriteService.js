const { connectDB } = require("../database/connection");
const contentService = require("./contentService");
const logger = require("../utils/logger");

const favoritesService = {
  // Get user favorites with pagination
  getUserFavorites: async (userId, options = {}) => {
    try {
      const { page = 1, limit = 20, type } = options;
      const offset = (page - 1) * limit;

      let query = connectDB("favorites")
        .where("user_id", userId)
        .orderBy("created_at", "desc");

      if (type) {
        query = query.where("content_type", type);
      }

      // Get total count
      const countQuery = query.clone();
      const [{ count }] = await countQuery.count();
      const total = parseInt(count);

      // Get favorites
      const favorites = await query
        .select("content_id", "content_type", "created_at")
        .limit(limit)
        .offset(offset);

      // Get content details for each favorite
      const movieIds = favorites
        .filter((f) => f.content_type === "movie")
        .map((f) => f.content_id);
      const seriesIds = favorites
        .filter((f) => f.content_type === "series")
        .map((f) => f.content_id);

      const [movies, series] = await Promise.all([
        movieIds.length > 0
          ? contentService.getContentByIds(movieIds, "movie")
          : [],
        seriesIds.length > 0
          ? contentService.getContentByIds(seriesIds, "series")
          : [],
      ]);

      // Map content to favorites
      const contentMap = new Map();
      movies.forEach((movie) => contentMap.set(`movie-${movie.id}`, movie));
      series.forEach((s) => contentMap.set(`series-${s.id}`, s));

      const data = favorites
        .map((favorite) => {
          const content = contentMap.get(
            `${favorite.content_type}-${favorite.content_id}`
          );
          if (!content) return null;

          return {
            ...content,
            contentType: favorite.content_type,
            addedAt: favorite.created_at,
          };
        })
        .filter(Boolean);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Get user favorites error:", error);
      throw error;
    }
  },

  // Add favorite
  addFavorite: async (userId, contentId, contentType) => {
    try {
      const [favorite] = await connectDB("favorites")
        .insert({
          user_id: userId,
          content_id: contentId,
          content_type: contentType,
        })
        .returning(["id", "created_at"]);

      return {
        id: favorite.id,
        createdAt: favorite.created_at,
      };
    } catch (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        throw new Error("Content already in favorites");
      }
      logger.error("Add favorite error:", error);
      throw error;
    }
  },

  // Remove favorite
  removeFavorite: async (userId, contentId, contentType) => {
    try {
      const result = await connectDB("favorites")
        .where({
          user_id: userId,
          content_id: contentId,
          content_type: contentType,
        })
        .delete();

      return result > 0;
    } catch (error) {
      logger.error("Remove favorite error:", error);
      throw error;
    }
  },

  // Check if content is favorited
  checkFavorite: async (userId, contentId, contentType) => {
    try {
      const favorite = await connectDB("favorites")
        .where({
          user_id: userId,
          content_id: contentId,
          content_type: contentType,
        })
        .first();

      return !!favorite;
    } catch (error) {
      logger.error("Check favorite error:", error);
      return false;
    }
  },

  // Get user favorite statistics
  getUserFavoriteStats: async (userId) => {
    try {
      const stats = await connectDB("favorites")
        .where("user_id", userId)
        .select(
          connectDB.raw("COUNT(*) as total"),
          connectDB.raw(
            "COUNT(CASE WHEN content_type = 'movie' THEN 1 END) as movies"
          ),
          connectDB.raw(
            "COUNT(CASE WHEN content_type = 'series' THEN 1 END) as series"
          )
        )
        .first();

      // Get favorite genres
      const favorites = await connectDB("favorites")
        .where("user_id", userId)
        .select("content_id", "content_type");

      const movieIds = favorites
        .filter((f) => f.content_type === "movie")
        .map((f) => f.content_id);
      const seriesIds = favorites
        .filter((f) => f.content_type === "series")
        .map((f) => f.content_id);

      const genreCounts = {};

      if (movieIds.length > 0) {
        const movies = await connectDB("movies")
          .whereIn("id", movieIds)
          .select("genres");

        movies.forEach((movie) => {
          (movie.genres || []).forEach((genre) => {
            genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
          });
        });
      }

      if (seriesIds.length > 0) {
        const series = await connectDB("series")
          .whereIn("id", seriesIds)
          .select("genres");

        series.forEach((s) => {
          (s.genres || []).forEach((genre) => {
            genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
          });
        });
      }

      const topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      return {
        total: parseInt(stats.total),
        movies: parseInt(stats.movies),
        series: parseInt(stats.series),
        topGenres,
      };
    } catch (error) {
      logger.error("Get user favorite stats error:", error);
      throw error;
    }
  },

  // Get most favorited content
  getMostFavorited: async (type = "all", limit = 10) => {
    try {
      let query = connectDB("favorites")
        .select("content_id", "content_type")
        .count("* as favorite_count")
        .groupBy("content_id", "content_type")
        .orderBy("favorite_count", "desc");

      if (type !== "all") {
        query = query.where("content_type", type);
      }

      const favorites = await query.limit(limit);

      // Get content details
      const movieIds = favorites
        .filter((f) => f.content_type === "movie")
        .map((f) => f.content_id);
      const seriesIds = favorites
        .filter((f) => f.content_type === "series")
        .map((f) => f.content_id);

      const [movies, series] = await Promise.all([
        movieIds.length > 0
          ? contentService.getContentByIds(movieIds, "movie")
          : [],
        seriesIds.length > 0
          ? contentService.getContentByIds(seriesIds, "series")
          : [],
      ]);

      // Map content with favorite count
      const contentMap = new Map();
      movies.forEach((movie) => contentMap.set(`movie-${movie.id}`, movie));
      series.forEach((s) => contentMap.set(`series-${s.id}`, s));

      return favorites
        .map((favorite) => {
          const content = contentMap.get(
            `${favorite.content_type}-${favorite.content_id}`
          );
          if (!content) return null;

          return {
            ...content,
            contentType: favorite.content_type,
            favoriteCount: parseInt(favorite.favorite_count),
          };
        })
        .filter(Boolean);
    } catch (error) {
      logger.error("Get most favorited error:", error);
      throw error;
    }
  },
};

module.exports = favoritesService;

const { connectDB } = require("../database/connection");
const contentService = require("./contentService");
const logger = require("../utils/logger");

const watchHistoryService = {
  // Update watch progress
  updateProgress: async (data) => {
    try {
      const { userId, contentId, contentType, progress, totalDuration } = data;

      // Calculate if completed (95% watched)
      const completed = progress >= totalDuration * 0.95;

      // Check if record exists
      const existing = await connectDB("watch_history")
        .where({
          user_id: userId,
          content_id: contentId,
          content_type: contentType,
        })
        .first();

      if (existing) {
        // Update existing record
        const [updated] = await connectDB("watch_history")
          .where({ id: existing.id })
          .update({
            progress,
            total_duration: totalDuration,
            completed,
            last_watched_at: connectDB.fn.now(),
          })
          .returning(["id", "progress", "completed", "last_watched_at"]);

        return {
          id: updated.id,
          progress: updated.progress,
          completed: updated.completed,
          lastWatchedAt: updated.last_watched_at,
        };
      } else {
        // Create new record
        const [created] = await connectDB("watch_history")
          .insert({
            user_id: userId,
            content_id: contentId,
            content_type: contentType,
            progress,
            total_duration: totalDuration,
            completed,
          })
          .returning(["id", "progress", "completed", "created_at"]);

        return {
          id: created.id,
          progress: created.progress,
          completed: created.completed,
          createdAt: created.created_at,
        };
      }
    } catch (error) {
      logger.error("Update watch progress error:", error);
      throw error;
    }
  },

  // Get user watch history
  getUserHistory: async (userId, page = 1, limit = 20) => {
    try {
      const offset = (page - 1) * limit;

      // Get total count
      const [{ count }] = await connectDB("watch_history")
        .where("user_id", userId)
        .count();
      const total = parseInt(count);

      // Get history records
      const history = await connectDB("watch_history")
        .where("user_id", userId)
        .orderBy("last_watched_at", "desc")
        .limit(limit)
        .offset(offset);

      // Get content details
      const movieIds = history
        .filter((h) => h.content_type === "movie")
        .map((h) => h.content_id);
      const seriesIds = history
        .filter((h) => h.content_type === "series")
        .map((h) => h.content_id);

      const [movies, series] = await Promise.all([
        movieIds.length > 0
          ? contentService.getContentByIds(movieIds, "movie")
          : [],
        seriesIds.length > 0
          ? contentService.getContentByIds(seriesIds, "series")
          : [],
      ]);

      // Map content to history
      const contentMap = new Map();
      movies.forEach((movie) => contentMap.set(`movie-${movie.id}`, movie));
      series.forEach((s) => contentMap.set(`series-${s.id}`, s));

      const data = history
        .map((record) => {
          const content = contentMap.get(
            `${record.content_type}-${record.content_id}`
          );
          if (!content) return null;

          return {
            ...content,
            contentType: record.content_type,
            progress: record.progress,
            totalDuration: record.total_duration,
            completed: record.completed,
            lastWatchedAt: record.last_watched_at,
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
      logger.error("Get user history error:", error);
      throw error;
    }
  },

  // Get continue watching
  getContinueWatching: async (userId, limit = 20) => {
    try {
      // Get incomplete watch history
      const history = await connectDB("watch_history")
        .where("user_id", userId)
        .where("completed", false)
        .where("progress", ">", 0)
        .orderBy("last_watched_at", "desc")
        .limit(limit);

      if (history.length === 0) return [];

      // Get content details
      const movieIds = history
        .filter((h) => h.content_type === "movie")
        .map((h) => h.content_id);
      const seriesIds = history
        .filter((h) => h.content_type === "series")
        .map((h) => h.content_id);

      const [movies, series] = await Promise.all([
        movieIds.length > 0
          ? contentService.getContentByIds(movieIds, "movie")
          : [],
        seriesIds.length > 0
          ? contentService.getContentByIds(seriesIds, "series")
          : [],
      ]);

      // Map content to history
      const contentMap = new Map();
      movies.forEach((movie) => contentMap.set(`movie-${movie.id}`, movie));
      series.forEach((s) => contentMap.set(`series-${s.id}`, s));

      return history
        .map((record) => {
          const content = contentMap.get(
            `${record.content_type}-${record.content_id}`
          );
          if (!content) return null;

          return {
            ...content,
            contentType: record.content_type,
            progress: record.progress,
            totalDuration: record.total_duration,
            lastWatchedAt: record.last_watched_at,
          };
        })
        .filter(Boolean);
    } catch (error) {
      logger.error("Get continue watching error:", error);
      return [];
    }
  },

  // Mark as watched
  markAsWatched: async (userId, contentId, contentType, duration) => {
    try {
      return await watchHistoryService.updateProgress({
        userId,
        contentId,
        contentType,
        progress: duration,
        totalDuration: duration,
      });
    } catch (error) {
      logger.error("Mark as watched error:", error);
      throw error;
    }
  },

  // Remove from history
  removeFromHistory: async (userId, contentId, contentType) => {
    try {
      const result = await connectDB("watch_history")
        .where({
          user_id: userId,
          content_id: contentId,
          content_type: contentType,
        })
        .delete();

      return result > 0;
    } catch (error) {
      logger.error("Remove from history error:", error);
      throw error;
    }
  },

  // Clear all history
  clearHistory: async (userId) => {
    try {
      await connectDB("watch_history").where("user_id", userId).delete();

      return true;
    } catch (error) {
      logger.error("Clear history error:", error);
      throw error;
    }
  },

  // Get watch stats
  getWatchStats: async (userId) => {
    try {
      const stats = await connectDB("watch_history")
        .where("user_id", userId)
        .select(
          connectDB.raw("COUNT(DISTINCT content_id) as total_watched"),
          connectDB.raw(
            "COUNT(CASE WHEN completed = true THEN 1 END) as completed_count"
          ),
          connectDB.raw("SUM(progress) as total_watch_time"),
          connectDB.raw(
            "COUNT(CASE WHEN content_type = 'movie' THEN 1 END) as movies_watched"
          ),
          connectDB.raw(
            "COUNT(CASE WHEN content_type = 'series' THEN 1 END) as series_watched"
          )
        )
        .first();

      return {
        totalWatched: parseInt(stats.total_watched),
        completedCount: parseInt(stats.completed_count),
        totalWatchTime: parseInt(stats.total_watch_time || 0),
        moviesWatched: parseInt(stats.movies_watched),
        seriesWatched: parseInt(stats.series_watched),
      };
    } catch (error) {
      logger.error("Get watch stats error:", error);
      throw error;
    }
  },
};

module.exports = watchHistoryService;

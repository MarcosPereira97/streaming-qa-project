const { connectDB } = require("../database/connection");
const contentService = require("./contentService");
const logger = require("../utils/logger");

const recommendationService = {
  // Get personalized recommendations
  getPersonalizedRecommendations: async (userId, type = "all", limit = 20) => {
    try {
      // Get user's favorite genres from watch history and favorites
      const userGenres = await recommendationService.getUserPreferredGenres(
        userId
      );

      if (userGenres.length === 0) {
        // Fall back to general recommendations
        return recommendationService.getGeneralRecommendations(type, limit);
      }

      let recommendations = [];

      // Get content based on preferred genres
      if (type === "all" || type === "movie") {
        const movieQuery = connectDB("movies")
          .select(
            "id",
            "title",
            "poster_path",
            "backdrop_path",
            "overview",
            "release_date",
            "imdb_rating",
            "popularity",
            "genres",
            connectDB.raw("'movie' as content_type")
          )
          .where("imdb_rating", ">=", 7.0)
          .orderBy("popularity", "desc")
          .limit(type === "all" ? limit / 2 : limit);

        // Add genre conditions
        userGenres.slice(0, 3).forEach((genre) => {
          movieQuery.orWhereRaw("genres @> ?", [
            JSON.stringify([{ name: genre }]),
          ]);
        });

        const movies = await movieQuery;
        recommendations = recommendations.concat(movies);
      }

      if (type === "all" || type === "series") {
        const seriesQuery = connectDB("series")
          .select(
            "id",
            "title",
            "poster_path",
            "backdrop_path",
            "overview",
            "first_air_date",
            "imdb_rating",
            "popularity",
            "genres",
            connectDB.raw("'series' as content_type")
          )
          .where("imdb_rating", ">=", 7.0)
          .orderBy("popularity", "desc")
          .limit(type === "all" ? limit / 2 : limit);

        // Add genre conditions
        userGenres.slice(0, 3).forEach((genre) => {
          seriesQuery.orWhereRaw("genres @> ?", [
            JSON.stringify([{ name: genre }]),
          ]);
        });

        const series = await seriesQuery;
        recommendations = recommendations.concat(series);
      }

      // Remove content already watched
      const watchedIds = await recommendationService.getUserWatchedIds(userId);
      recommendations = recommendations.filter(
        (item) => !watchedIds.has(`${item.content_type}-${item.id}`)
      );

      // Sort by relevance score
      recommendations.sort((a, b) => {
        const scoreA = recommendationService.calculateRelevanceScore(
          a,
          userGenres
        );
        const scoreB = recommendationService.calculateRelevanceScore(
          b,
          userGenres
        );
        return scoreB - scoreA;
      });

      return recommendations.slice(0, limit);
    } catch (error) {
      logger.error("Get personalized recommendations error:", error);
      return recommendationService.getGeneralRecommendations(type, limit);
    }
  },

  // Get general recommendations
  getGeneralRecommendations: async (type = "all", limit = 20) => {
    try {
      let recommendations = [];

      if (type === "all" || type === "movie") {
        const movies = await connectDB("movies")
          .select(
            "id",
            "title",
            "poster_path",
            "backdrop_path",
            "overview",
            "release_date",
            "imdb_rating",
            "popularity",
            "genres",
            connectDB.raw("'movie' as content_type")
          )
          .where("imdb_rating", ">=", 7.5)
          .orderBy("popularity", "desc")
          .limit(type === "all" ? limit / 2 : limit);

        recommendations = recommendations.concat(movies);
      }

      if (type === "all" || type === "series") {
        const series = await connectDB("series")
          .select(
            "id",
            "title",
            "poster_path",
            "backdrop_path",
            "overview",
            "first_air_date",
            "imdb_rating",
            "popularity",
            "genres",
            connectDB.raw("'series' as content_type")
          )
          .where("imdb_rating", ">=", 7.5)
          .orderBy("popularity", "desc")
          .limit(type === "all" ? limit / 2 : limit);

        recommendations = recommendations.concat(series);
      }

      // Sort by popularity
      recommendations.sort((a, b) => b.popularity - a.popularity);

      return recommendations.slice(0, limit);
    } catch (error) {
      logger.error("Get general recommendations error:", error);
      return [];
    }
  },

  // Get user's preferred genres
  getUserPreferredGenres: async (userId) => {
    try {
      // Get genres from watch history
      const watchHistory = await connectDB("watch_history")
        .where("user_id", userId)
        .select("content_id", "content_type");

      // Get genres from favorites
      const favorites = await connectDB("favorites")
        .where("user_id", userId)
        .select("content_id", "content_type");

      const allContent = [...watchHistory, ...favorites];
      const genreCounts = {};

      // Get movie genres
      const movieIds = allContent
        .filter((c) => c.content_type === "movie")
        .map((c) => c.content_id);

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

      // Get series genres
      const seriesIds = allContent
        .filter((c) => c.content_type === "series")
        .map((c) => c.content_id);

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

      // Sort genres by count
      return Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([genre]) => genre);
    } catch (error) {
      logger.error("Get user preferred genres error:", error);
      return [];
    }
  },

  // Get user's watched content IDs
  getUserWatchedIds: async (userId) => {
    try {
      const watched = await connectDB("watch_history")
        .where("user_id", userId)
        .select("content_id", "content_type");

      return new Set(watched.map((w) => `${w.content_type}-${w.content_id}`));
    } catch (error) {
      logger.error("Get user watched IDs error:", error);
      return new Set();
    }
  },

  // Calculate relevance score
  calculateRelevanceScore: (content, userGenres) => {
    let score = content.popularity / 100; // Base score from popularity

    // Add score for matching genres
    const contentGenres = (content.genres || []).map((g) => g.name);
    userGenres.forEach((genre, index) => {
      if (contentGenres.includes(genre)) {
        // Higher weight for top genres
        score += (10 - index) * 10;
      }
    });

    // Add score for rating
    if (content.imdb_rating) {
      score += content.imdb_rating * 5;
    }

    // Boost recent content
    const releaseDate = new Date(
      content.release_date || content.first_air_date
    );
    const yearsSinceRelease =
      (new Date() - releaseDate) / (365 * 24 * 60 * 60 * 1000);
    if (yearsSinceRelease < 1) {
      score += 20;
    } else if (yearsSinceRelease < 3) {
      score += 10;
    }

    return score;
  },

  // Get similar content recommendations
  getSimilarRecommendations: async (contentId, contentType, limit = 10) => {
    try {
      const table = contentType === "movie" ? "movies" : "series";

      // Get the original content
      const original = await connectDB(table).where("id", contentId).first();

      if (!original) return [];

      // Find similar content based on genres
      const similarQuery = connectDB(table)
        .select(
          "id",
          "title",
          "poster_path",
          "overview",
          "imdb_rating",
          "popularity",
          "genres",
          contentType === "movie" ? "release_date" : "first_air_date",
          connectDB.raw(`'${contentType}' as content_type`)
        )
        .whereNot("id", contentId)
        .where("imdb_rating", ">=", 6.0)
        .orderBy("popularity", "desc")
        .limit(limit * 2); // Get more to filter

      // Add genre conditions
      (original.genres || []).slice(0, 2).forEach((genre) => {
        similarQuery.orWhereRaw("genres @> ?", [JSON.stringify([genre])]);
      });

      const similar = await similarQuery;

      // Sort by similarity score
      similar.sort((a, b) => {
        const scoreA = recommendationService.calculateSimilarityScore(
          a,
          original
        );
        const scoreB = recommendationService.calculateSimilarityScore(
          b,
          original
        );
        return scoreB - scoreA;
      });

      return similar.slice(0, limit);
    } catch (error) {
      logger.error("Get similar recommendations error:", error);
      return [];
    }
  },

  // Calculate similarity score
  calculateSimilarityScore: (content, original) => {
    let score = 0;

    // Genre matching
    const contentGenres = (content.genres || []).map((g) => g.id);
    const originalGenres = (original.genres || []).map((g) => g.id);
    const commonGenres = contentGenres.filter((g) =>
      originalGenres.includes(g)
    );
    score += commonGenres.length * 20;

    // Similar rating
    const ratingDiff = Math.abs(
      (content.imdb_rating || 0) - (original.imdb_rating || 0)
    );
    score += Math.max(0, 10 - ratingDiff * 2);

    // Popularity
    score += content.popularity / 100;

    return score;
  },
};

module.exports = recommendationService;

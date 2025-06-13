const { connectDB } = require("../database/connection");
const redisClient = require("../utils/redis");
const logger = require("../utils/logger");

const searchService = {
  // Search content
  searchContent: async (options) => {
    try {
      const { query, type = "all", page = 1, limit = 20 } = options;

      const offset = (page - 1) * limit;
      const searchTerm = `%${query.toLowerCase()}%`;

      let results = [];
      let total = 0;

      if (type === "all" || type === "movie") {
        // Search movies
        const movieQuery = connectDB("movies")
          .whereRaw("LOWER(title) LIKE ?", [searchTerm])
          .orWhereRaw("LOWER(original_title) LIKE ?", [searchTerm])
          .orWhereRaw("LOWER(overview) LIKE ?", [searchTerm])
          .orWhereRaw("LOWER(director) LIKE ?", [searchTerm]);

        const movieCount = await movieQuery.clone().count();
        const movies = await movieQuery
          .select(
            "id",
            "title",
            "poster_path",
            "overview",
            "release_date",
            "imdb_rating",
            "popularity",
            connectDB.raw("'movie' as content_type")
          )
          .orderBy("popularity", "desc")
          .limit(type === "all" ? limit / 2 : limit)
          .offset(type === "all" ? 0 : offset);

        results = results.concat(movies);
        total += parseInt(movieCount[0].count);
      }

      if (type === "all" || type === "series") {
        // Search series
        const seriesQuery = connectDB("series")
          .whereRaw("LOWER(title) LIKE ?", [searchTerm])
          .orWhereRaw("LOWER(original_title) LIKE ?", [searchTerm])
          .orWhereRaw("LOWER(overview) LIKE ?", [searchTerm]);

        const seriesCount = await seriesQuery.clone().count();
        const series = await seriesQuery
          .select(
            "id",
            "title",
            "poster_path",
            "overview",
            "first_air_date",
            "imdb_rating",
            "popularity",
            connectDB.raw("'series' as content_type")
          )
          .orderBy("popularity", "desc")
          .limit(type === "all" ? limit / 2 : limit)
          .offset(type === "all" ? 0 : offset);

        results = results.concat(series);
        total += parseInt(seriesCount[0].count);
      }

      // Sort combined results by relevance
      if (type === "all") {
        results.sort((a, b) => {
          // Prioritize exact title matches
          const aExact = a.title.toLowerCase() === query.toLowerCase();
          const bExact = b.title.toLowerCase() === query.toLowerCase();
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;

          // Then sort by popularity
          return b.popularity - a.popularity;
        });

        results = results.slice(0, limit);
      }

      return {
        results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Search content error:", error);
      throw error;
    }
  },

  // Get search suggestions
  getSuggestions: async (query) => {
    try {
      const searchTerm = `${query.toLowerCase()}%`;
      const limit = 10;

      // Get movie titles
      const movies = await connectDB("movies")
        .whereRaw("LOWER(title) LIKE ?", [searchTerm])
        .select("title")
        .orderBy("popularity", "desc")
        .limit(limit / 2);

      // Get series titles
      const series = await connectDB("series")
        .whereRaw("LOWER(title) LIKE ?", [searchTerm])
        .select("title")
        .orderBy("popularity", "desc")
        .limit(limit / 2);

      // Combine and deduplicate
      const suggestions = [
        ...new Set([
          ...movies.map((m) => m.title),
          ...series.map((s) => s.title),
        ]),
      ].slice(0, limit);

      return suggestions;
    } catch (error) {
      logger.error("Get suggestions error:", error);
      return [];
    }
  },

  // Record search for analytics
  recordSearch: async (userId, query) => {
    try {
      const key = "search_history";
      const userKey = `user_search:${userId}`;
      const timestamp = Date.now();

      // Add to global search history
      await redisClient.zAdd(key, {
        score: timestamp,
        value: query,
      });

      // Add to user search history
      await redisClient.zAdd(userKey, {
        score: timestamp,
        value: query,
      });

      // Keep only last 1000 searches globally
      await redisClient.zRemRangeByRank(key, 0, -1001);

      // Keep only last 50 searches per user
      await redisClient.zRemRangeByRank(userKey, 0, -51);

      // Increment search count
      await redisClient.zIncrBy("popular_searches", 1, query.toLowerCase());
    } catch (error) {
      logger.error("Record search error:", error);
    }
  },

  // Get popular searches
  getPopularSearches: async (limit = 10) => {
    try {
      const searches = await redisClient.zRange(
        "popular_searches",
        0,
        limit - 1,
        {
          REV: true,
          WITHSCORES: true,
        }
      );

      return searches
        .filter((_, index) => index % 2 === 0)
        .map((search, index) => ({
          query: search,
          count: parseInt(searches[index * 2 + 1]),
        }));
    } catch (error) {
      logger.error("Get popular searches error:", error);
      return [];
    }
  },

  // Advanced search
  advancedSearch: async (filters) => {
    try {
      const {
        query,
        type = "all",
        genres = [],
        yearFrom,
        yearTo,
        ratingMin,
        ratingMax,
        sortBy = "relevance",
        page = 1,
        limit = 20,
      } = filters;

      const offset = (page - 1) * limit;
      let results = [];
      let total = 0;

      // Build base query function
      const buildQuery = (table) => {
        let q = connectDB(table);

        if (query) {
          const searchTerm = `%${query.toLowerCase()}%`;
          q = q.where(function () {
            this.whereRaw("LOWER(title) LIKE ?", [searchTerm]).orWhereRaw(
              "LOWER(overview) LIKE ?",
              [searchTerm]
            );
          });
        }

        if (genres.length > 0) {
          genres.forEach((genre) => {
            q = q.whereRaw("genres @> ?", [JSON.stringify([{ name: genre }])]);
          });
        }

        if (ratingMin !== undefined) {
          q = q.where("imdb_rating", ">=", ratingMin);
        }

        if (ratingMax !== undefined) {
          q = q.where("imdb_rating", "<=", ratingMax);
        }

        return q;
      };

      if (type === "all" || type === "movie") {
        let movieQuery = buildQuery("movies");

        if (yearFrom) {
          movieQuery = movieQuery.whereRaw(
            "EXTRACT(YEAR FROM release_date) >= ?",
            [yearFrom]
          );
        }
        if (yearTo) {
          movieQuery = movieQuery.whereRaw(
            "EXTRACT(YEAR FROM release_date) <= ?",
            [yearTo]
          );
        }

        const movieCount = await movieQuery.clone().count();
        const movies = await movieQuery.select(
          "id",
          "title",
          "poster_path",
          "overview",
          "release_date",
          "imdb_rating",
          "popularity",
          "genres",
          connectDB.raw("'movie' as content_type")
        );

        results = results.concat(movies);
        total += parseInt(movieCount[0].count);
      }

      if (type === "all" || type === "series") {
        let seriesQuery = buildQuery("series");

        if (yearFrom) {
          seriesQuery = seriesQuery.whereRaw(
            "EXTRACT(YEAR FROM first_air_date) >= ?",
            [yearFrom]
          );
        }
        if (yearTo) {
          seriesQuery = seriesQuery.whereRaw(
            "EXTRACT(YEAR FROM first_air_date) <= ?",
            [yearTo]
          );
        }

        const seriesCount = await seriesQuery.clone().count();
        const series = await seriesQuery.select(
          "id",
          "title",
          "poster_path",
          "overview",
          "first_air_date",
          "imdb_rating",
          "popularity",
          "genres",
          connectDB.raw("'series' as content_type")
        );

        results = results.concat(series);
        total += parseInt(seriesCount[0].count);
      }

      // Apply sorting
      switch (sortBy) {
        case "popularity":
          results.sort((a, b) => b.popularity - a.popularity);
          break;
        case "release_date":
          results.sort((a, b) => {
            const dateA = new Date(a.release_date || a.first_air_date);
            const dateB = new Date(b.release_date || b.first_air_date);
            return dateB - dateA;
          });
          break;
        case "imdb_rating":
          results.sort((a, b) => (b.imdb_rating || 0) - (a.imdb_rating || 0));
          break;
        case "title":
          results.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "relevance":
        default:
          if (query) {
            results.sort((a, b) => {
              const aRelevance = this.calculateRelevance(a, query);
              const bRelevance = this.calculateRelevance(b, query);
              return bRelevance - aRelevance;
            });
          }
      }

      // Apply pagination
      const paginatedResults = results.slice(offset, offset + limit);

      return {
        results: paginatedResults,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Advanced search error:", error);
      throw error;
    }
  },

  // Calculate relevance score for sorting
  calculateRelevance: (item, query) => {
    const lowerQuery = query.toLowerCase();
    const lowerTitle = item.title.toLowerCase();
    const lowerOverview = (item.overview || "").toLowerCase();

    let score = 0;

    // Exact title match
    if (lowerTitle === lowerQuery) score += 100;

    // Title starts with query
    if (lowerTitle.startsWith(lowerQuery)) score += 50;

    // Title contains query
    if (lowerTitle.includes(lowerQuery)) score += 30;

    // Overview contains query
    if (lowerOverview.includes(lowerQuery)) score += 10;

    // Boost by popularity
    score += item.popularity / 100;

    return score;
  },
};

module.exports = searchService;

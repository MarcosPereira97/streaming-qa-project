const { connectDB } = require("../database/connection");
const logger = require("../utils/logger");

const contentService = {
  // Get movies with filters and pagination
  getMovies: async (options) => {
    try {
      const {
        page = 1,
        limit = 20,
        genre,
        year,
        sortBy = "popularity",
        order = "desc",
      } = options;

      const offset = (page - 1) * limit;

      let query = connectDB("movies").select(
        "id",
        "tmdb_id",
        "title",
        "overview",
        "poster_path",
        "backdrop_path",
        "release_date",
        "runtime",
        "imdb_rating",
        "tmdb_rating",
        "popularity",
        "genres"
      );

      // Apply filters
      if (genre) {
        query = query.whereRaw("genres @> ?", [
          JSON.stringify([{ name: genre }]),
        ]);
      }

      if (year) {
        query = query.whereRaw("EXTRACT(YEAR FROM release_date) = ?", [year]);
      }

      // Get total count
      const countQuery = query.clone();
      const [{ count }] = await countQuery.count();
      const total = parseInt(count);

      // Apply sorting and pagination
      const validSortColumns = {
        popularity: "popularity",
        release_date: "release_date",
        imdb_rating: "imdb_rating",
        title: "title",
      };

      const sortColumn = validSortColumns[sortBy] || "popularity";
      const results = await query
        .orderBy(sortColumn, order)
        .limit(limit)
        .offset(offset);

      return {
        data: results.map((movie) => ({
          ...movie,
          genres: movie.genres || [],
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Get movies error:", error);
      throw error;
    }
  },

  // Get movie by ID
  getMovieById: async (id) => {
    try {
      const movie = await connectDB("movies").where("id", id).first();

      if (!movie) return null;

      return {
        ...movie,
        genres: movie.genres || [],
        production_companies: movie.production_companies || [],
        cast_members: movie.cast_members || [],
      };
    } catch (error) {
      logger.error("Get movie by ID error:", error);
      throw error;
    }
  },

  // Get series with filters and pagination
  getSeries: async (options) => {
    try {
      const {
        page = 1,
        limit = 20,
        genre,
        year,
        status,
        sortBy = "popularity",
        order = "desc",
      } = options;

      const offset = (page - 1) * limit;

      let query = connectDB("series").select(
        "id",
        "tmdb_id",
        "title",
        "overview",
        "poster_path",
        "backdrop_path",
        "first_air_date",
        "last_air_date",
        "number_of_seasons",
        "number_of_episodes",
        "imdb_rating",
        "tmdb_rating",
        "popularity",
        "genres",
        "status"
      );

      // Apply filters
      if (genre) {
        query = query.whereRaw("genres @> ?", [
          JSON.stringify([{ name: genre }]),
        ]);
      }

      if (year) {
        query = query.whereRaw("EXTRACT(YEAR FROM first_air_date) = ?", [year]);
      }

      if (status) {
        query = query.where("status", status);
      }

      // Get total count
      const countQuery = query.clone();
      const [{ count }] = await countQuery.count();
      const total = parseInt(count);

      // Apply sorting and pagination
      const validSortColumns = {
        popularity: "popularity",
        first_air_date: "first_air_date",
        imdb_rating: "imdb_rating",
        title: "title",
      };

      const sortColumn = validSortColumns[sortBy] || "popularity";
      const results = await query
        .orderBy(sortColumn, order)
        .limit(limit)
        .offset(offset);

      return {
        data: results.map((series) => ({
          ...series,
          genres: series.genres || [],
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Get series error:", error);
      throw error;
    }
  },

  // Get series by ID
  getSeriesById: async (id) => {
    try {
      const series = await connectDB("series").where("id", id).first();

      if (!series) return null;

      return {
        ...series,
        genres: series.genres || [],
        networks: series.networks || [],
        cast_members: series.cast_members || [],
        creators: series.creators || [],
      };
    } catch (error) {
      logger.error("Get series by ID error:", error);
      throw error;
    }
  },

  // Get trending content
  getTrending: async (type = "all", timeWindow = "week") => {
    try {
      const limit = 20;
      let results = [];

      // Calculate date threshold based on time window
      const dateThreshold = new Date();
      switch (timeWindow) {
        case "day":
          dateThreshold.setDate(dateThreshold.getDate() - 1);
          break;
        case "week":
          dateThreshold.setDate(dateThreshold.getDate() - 7);
          break;
        case "month":
          dateThreshold.setMonth(dateThreshold.getMonth() - 1);
          break;
      }

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
            connectDB.raw("'movie' as content_type")
          )
          .where("release_date", ">=", dateThreshold)
          .orderBy("popularity", "desc")
          .limit(type === "all" ? limit / 2 : limit);

        results = results.concat(movies);
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
            connectDB.raw("'series' as content_type")
          )
          .where("first_air_date", ">=", dateThreshold)
          .orderBy("popularity", "desc")
          .limit(type === "all" ? limit / 2 : limit);

        results = results.concat(series);
      }

      // Sort combined results by popularity
      results.sort((a, b) => b.popularity - a.popularity);

      return results.slice(0, limit);
    } catch (error) {
      logger.error("Get trending error:", error);
      throw error;
    }
  },

  // Get all unique genres
  getGenres: async () => {
    try {
      // Get movie genres
      const movieGenres = await connectDB("movies")
        .select(connectDB.raw("jsonb_array_elements(genres) as genre"))
        .distinct();

      // Get series genres
      const seriesGenres = await connectDB("series")
        .select(connectDB.raw("jsonb_array_elements(genres) as genre"))
        .distinct();

      // Combine and deduplicate
      const allGenres = [...movieGenres, ...seriesGenres];
      const uniqueGenres = Array.from(
        new Map(allGenres.map((item) => [item.genre.id, item.genre])).values()
      );

      return uniqueGenres.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      logger.error("Get genres error:", error);
      throw error;
    }
  },

  // Get similar content
  getSimilarContent: async (contentId, contentType, limit = 10) => {
    try {
      const table = contentType === "movie" ? "movies" : "series";

      // Get the original content
      const original = await connectDB(table).where("id", contentId).first();

      if (!original) return [];

      // Find similar content based on genres
      const similarContent = await connectDB(table)
        .select(
          "id",
          "title",
          "poster_path",
          "overview",
          "imdb_rating",
          "popularity",
          contentType === "movie" ? "release_date" : "first_air_date"
        )
        .whereNot("id", contentId)
        .whereRaw("genres && ?", [JSON.stringify(original.genres)])
        .orderBy("popularity", "desc")
        .limit(limit);

      return similarContent;
    } catch (error) {
      logger.error("Get similar content error:", error);
      return [];
    }
  },

  // Get content by multiple IDs
  getContentByIds: async (ids, contentType) => {
    try {
      const table = contentType === "movie" ? "movies" : "series";

      const content = await connectDB(table)
        .whereIn("id", ids)
        .select(
          "id",
          "title",
          "poster_path",
          "backdrop_path",
          "overview",
          "imdb_rating",
          "popularity",
          contentType === "movie" ? "release_date" : "first_air_date",
          contentType === "movie" ? "runtime" : "episode_runtime"
        );

      // Preserve the order of IDs
      const contentMap = new Map(content.map((item) => [item.id, item]));
      return ids.map((id) => contentMap.get(id)).filter(Boolean);
    } catch (error) {
      logger.error("Get content by IDs error:", error);
      throw error;
    }
  },
};

module.exports = contentService;

const cron = require("node-cron");
const axios = require("axios");
const { connectDB } = require("../database/connection");
const logger = require("../utils/logger");

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const contentSyncService = {
  // Sync trending movies
  syncTrendingMovies: async () => {
    try {
      if (!TMDB_API_KEY) {
        logger.warn("TMDB API key not configured");
        return;
      }

      const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
        params: { api_key: TMDB_API_KEY },
      });

      const movies = response.data.results;

      for (const movie of movies) {
        await contentSyncService.upsertMovie(movie);
      }

      logger.info(`Synced ${movies.length} trending movies`);
    } catch (error) {
      logger.error("Error syncing trending movies:", error);
    }
  },

  // Sync trending series
  syncTrendingSeries: async () => {
    try {
      if (!TMDB_API_KEY) {
        logger.warn("TMDB API key not configured");
        return;
      }

      const response = await axios.get(`${TMDB_BASE_URL}/trending/tv/week`, {
        params: { api_key: TMDB_API_KEY },
      });

      const series = response.data.results;

      for (const show of series) {
        await contentSyncService.upsertSeries(show);
      }

      logger.info(`Synced ${series.length} trending series`);
    } catch (error) {
      logger.error("Error syncing trending series:", error);
    }
  },

  // Upsert movie
  upsertMovie: async (movieData) => {
    try {
      // Get additional details
      const details = await axios.get(
        `${TMDB_BASE_URL}/movie/${movieData.id}`,
        {
          params: { api_key: TMDB_API_KEY, append_to_response: "credits" },
        }
      );

      const movie = details.data;

      // Extract director
      const director = movie.credits?.crew?.find(
        (person) => person.job === "Director"
      )?.name;

      // Extract main cast
      const cast = movie.credits?.cast?.slice(0, 10).map((actor) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profile_path: actor.profile_path,
      }));

      const movieRecord = {
        tmdb_id: movie.id,
        title: movie.title,
        original_title: movie.original_title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        release_date: movie.release_date,
        runtime: movie.runtime,
        tmdb_rating: movie.vote_average,
        popularity: movie.popularity,
        genres: movie.genres,
        production_companies: movie.production_companies?.slice(0, 5),
        cast_members: cast,
        director,
        language: movie.original_language,
        budget: movie.budget,
        revenue: movie.revenue,
      };

      // Check if movie exists
      const existing = await connectDB("movies")
        .where("tmdb_id", movie.id)
        .first();

      if (existing) {
        await connectDB("movies").where("id", existing.id).update(movieRecord);
      } else {
        await connectDB("movies").insert(movieRecord);
      }
    } catch (error) {
      logger.error(`Error upserting movie ${movieData.id}:`, error);
    }
  },

  // Upsert series
  upsertSeries: async (seriesData) => {
    try {
      // Get additional details
      const details = await axios.get(`${TMDB_BASE_URL}/tv/${seriesData.id}`, {
        params: { api_key: TMDB_API_KEY, append_to_response: "credits" },
      });

      const series = details.data;

      // Extract creators
      const creators = series.created_by?.map((creator) => ({
        id: creator.id,
        name: creator.name,
        profile_path: creator.profile_path,
      }));

      // Extract main cast
      const cast = series.credits?.cast?.slice(0, 10).map((actor) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profile_path: actor.profile_path,
      }));

      const seriesRecord = {
        tmdb_id: series.id,
        title: series.name,
        original_title: series.original_name,
        overview: series.overview,
        poster_path: series.poster_path,
        backdrop_path: series.backdrop_path,
        first_air_date: series.first_air_date,
        last_air_date: series.last_air_date,
        number_of_seasons: series.number_of_seasons,
        number_of_episodes: series.number_of_episodes,
        episode_runtime: series.episode_run_time,
        tmdb_rating: series.vote_average,
        popularity: series.popularity,
        genres: series.genres,
        networks: series.networks?.slice(0, 3),
        cast_members: cast,
        creators,
        status: series.status,
        language: series.original_language,
      };

      // Check if series exists
      const existing = await connectDB("series")
        .where("tmdb_id", series.id)
        .first();

      if (existing) {
        await connectDB("series").where("id", existing.id).update(seriesRecord);
      } else {
        await connectDB("series").insert(seriesRecord);
      }
    } catch (error) {
      logger.error(`Error upserting series ${seriesData.id}:`, error);
    }
  },

  // Update IMDB ratings
  updateIMDBRatings: async () => {
    try {
      // This is a placeholder - in production, you would integrate with OMDB API
      // or another service that provides IMDB ratings
      logger.info("IMDB ratings update skipped - API integration needed");
    } catch (error) {
      logger.error("Error updating IMDB ratings:", error);
    }
  },
};

// Cron job schedules
const startCronJobs = () => {
  // Sync trending content every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    logger.info("Starting content sync...");
    await Promise.all([
      contentSyncService.syncTrendingMovies(),
      contentSyncService.syncTrendingSeries(),
    ]);
  });

  // Update IMDB ratings once a day
  cron.schedule("0 3 * * *", async () => {
    logger.info("Starting IMDB ratings update...");
    await contentSyncService.updateIMDBRatings();
  });

  // Initial sync on startup (delayed)
  setTimeout(async () => {
    logger.info("Running initial content sync...");
    await Promise.all([
      contentSyncService.syncTrendingMovies(),
      contentSyncService.syncTrendingSeries(),
    ]);
  }, 5000);
};

module.exports = {
  contentSyncService,
  startCronJobs,
};

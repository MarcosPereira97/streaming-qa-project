const Joi = require("joi");

const contentSchemas = {
  getContent: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    genre: Joi.string().optional(),
    year: Joi.number()
      .integer()
      .min(1900)
      .max(new Date().getFullYear() + 5)
      .optional(),
    status: Joi.string()
      .valid("Ended", "Returning Series", "Canceled", "In Production")
      .optional(),
    sortBy: Joi.string()
      .valid(
        "popularity",
        "release_date",
        "imdb_rating",
        "title",
        "first_air_date"
      )
      .default("popularity"),
    order: Joi.string().valid("asc", "desc").default("desc"),
  }),

  contentId: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  getTrending: Joi.object({
    type: Joi.string().valid("all", "movie", "series").default("all"),
    timeWindow: Joi.string().valid("day", "week", "month").default("week"),
  }),

  getRecommendations: Joi.object({
    type: Joi.string().valid("all", "movie", "series").default("all"),
    limit: Joi.number().integer().min(1).max(50).default(20),
  }),

  updateWatchHistory: Joi.object({
    contentId: Joi.string().uuid().required(),
    contentType: Joi.string().valid("movie", "series").required(),
    progress: Joi.number().integer().min(0).required(),
    totalDuration: Joi.number().integer().min(1).required(),
  }),

  getWatchHistory: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

const favoritesSchemas = {
  getFavorites: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    type: Joi.string().valid("movie", "series").optional(),
  }),

  addFavorite: Joi.object({
    contentId: Joi.string().uuid().required(),
    contentType: Joi.string().valid("movie", "series").required(),
  }),

  removeFavorite: Joi.object({
    contentId: Joi.string().uuid().required(),
  }),

  removeFavoriteBody: Joi.object({
    contentType: Joi.string().valid("movie", "series").required(),
  }),

  checkFavorite: Joi.object({
    contentId: Joi.string().uuid().required(),
  }),

  checkFavoriteQuery: Joi.object({
    contentType: Joi.string().valid("movie", "series").required(),
  }),
};

const searchSchemas = {
  search: Joi.object({
    q: Joi.string().min(2).max(100).required(),
    type: Joi.string().valid("all", "movie", "series").default("all"),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),

  suggestions: Joi.object({
    q: Joi.string().min(2).max(50).required(),
  }),

  advancedSearch: Joi.object({
    query: Joi.string().min(2).max(100).optional(),
    type: Joi.string().valid("all", "movie", "series").default("all"),
    genres: Joi.array().items(Joi.string()).optional(),
    yearFrom: Joi.number().integer().min(1900).optional(),
    yearTo: Joi.number()
      .integer()
      .max(new Date().getFullYear() + 5)
      .optional(),
    ratingMin: Joi.number().min(0).max(10).optional(),
    ratingMax: Joi.number().min(0).max(10).optional(),
    sortBy: Joi.string()
      .valid("relevance", "popularity", "release_date", "imdb_rating", "title")
      .default("relevance"),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }).custom((value, helpers) => {
    if (value.yearFrom && value.yearTo && value.yearFrom > value.yearTo) {
      return helpers.error("any.invalid", {
        message: "yearFrom must be less than or equal to yearTo",
      });
    }
    if (
      value.ratingMin &&
      value.ratingMax &&
      value.ratingMin > value.ratingMax
    ) {
      return helpers.error("any.invalid", {
        message: "ratingMin must be less than or equal to ratingMax",
      });
    }
    return value;
  }),
};

module.exports = {
  contentSchemas,
  favoritesSchemas,
  searchSchemas,
};

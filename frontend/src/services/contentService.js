import api from "./api";

const contentService = {
  // Get movies
  getMovies: async (params = {}) => {
    const response = await api.get("/content/movies", { params });
    return response.data;
  },

  // Get movie by ID
  getMovieById: async (id) => {
    const response = await api.get(`/content/movies/${id}`);
    return response.data;
  },

  // Get series
  getSeries: async (params = {}) => {
    const response = await api.get("/content/series", { params });
    return response.data;
  },

  // Get series by ID
  getSeriesById: async (id) => {
    const response = await api.get(`/content/series/${id}`);
    return response.data;
  },

  // Get trending content
  getTrending: async (type = "all", timeWindow = "week") => {
    const response = await api.get("/content/trending", {
      params: { type, timeWindow },
    });
    return response.data;
  },

  // Get genres
  getGenres: async () => {
    const response = await api.get("/content/genres");
    return response.data;
  },

  // Get recommendations
  getRecommendations: async (type = "all", limit = 20) => {
    const response = await api.get("/content/recommendations", {
      params: { type, limit },
    });
    return response.data;
  },

  // Update watch history
  updateWatchHistory: async (data) => {
    const response = await api.post("/content/watch-history", data);
    return response.data;
  },

  // Get watch history
  getWatchHistory: async (params = {}) => {
    const response = await api.get("/content/watch-history", { params });
    return response.data;
  },

  // Get continue watching
  getContinueWatching: async () => {
    const response = await api.get("/content/continue-watching");
    return response.data;
  },

  // Search content
  searchContent: async (query, params = {}) => {
    const response = await api.get("/search", {
      params: { q: query, ...params },
    });
    return response.data;
  },

  // Get search suggestions
  getSearchSuggestions: async (query) => {
    const response = await api.get("/search/suggestions", {
      params: { q: query },
    });
    return response.data;
  },

  // Get popular searches
  getPopularSearches: async () => {
    const response = await api.get("/search/popular");
    return response.data;
  },

  // Advanced search
  advancedSearch: async (filters) => {
    const response = await api.post("/search/advanced", filters);
    return response.data;
  },
};

export default contentService;

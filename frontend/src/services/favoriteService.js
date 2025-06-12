import api from "./api";

const favoritesService = {
  // Get user favorites
  getFavorites: async (params = {}) => {
    const response = await api.get("/favorites", { params });
    return response.data;
  },

  // Add to favorites
  addFavorite: async (contentId, contentType) => {
    const response = await api.post("/favorites", {
      contentId,
      contentType,
    });
    return response.data;
  },

  // Remove from favorites
  removeFavorite: async (contentId, contentType) => {
    const response = await api.delete(`/favorites/${contentId}`, {
      params: { contentType },
    });
    return response.data;
  },

  // Check if content is favorited
  checkFavorite: async (contentId, contentType) => {
    const response = await api.get(`/favorites/check/${contentId}`, {
      params: { contentType },
    });
    return response.data;
  },

  // Get favorite statistics
  getFavoriteStats: async () => {
    const response = await api.get("/favorites/stats");
    return response.data;
  },
};

export default favoritesService;

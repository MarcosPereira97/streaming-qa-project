import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import favoritesService from "../../services/favoritesService";
import { toast } from "react-toastify";

const initialState = {
  favorites: {
    data: [],
    pagination: null,
    isLoading: false,
    error: null,
  },
  favoriteIds: new Set(),
  stats: null,
};

// Async thunks
export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async ({ page = 1, limit = 20, type } = {}) => {
    const response = await favoritesService.getFavorites({ page, limit, type });
    return response;
  }
);

export const addToFavorites = createAsyncThunk(
  "favorites/addToFavorites",
  async ({ contentId, contentType }) => {
    const response = await favoritesService.addFavorite(contentId, contentType);
    toast.success("Added to favorites");
    return { contentId, contentType, ...response };
  }
);

export const removeFromFavorites = createAsyncThunk(
  "favorites/removeFromFavorites",
  async ({ contentId, contentType }) => {
    await favoritesService.removeFavorite(contentId, contentType);
    toast.success("Removed from favorites");
    return { contentId, contentType };
  }
);

export const checkFavorite = createAsyncThunk(
  "favorites/checkFavorite",
  async ({ contentId, contentType }) => {
    const response = await favoritesService.checkFavorite(
      contentId,
      contentType
    );
    return { contentId, contentType, isFavorited: response.isFavorited };
  }
);

export const fetchFavoriteStats = createAsyncThunk(
  "favorites/fetchFavoriteStats",
  async () => {
    const response = await favoritesService.getFavoriteStats();
    return response;
  }
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    clearFavorites: (state) => {
      state.favorites.data = [];
      state.favorites.pagination = null;
      state.favoriteIds.clear();
      state.stats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.favorites.isLoading = true;
        state.favorites.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.favorites.isLoading = false;
        state.favorites.data = action.payload.data;
        state.favorites.pagination = action.payload.pagination;
        // Update favoriteIds set
        state.favoriteIds = new Set(
          action.payload.data.map((item) => `${item.contentType}-${item.id}`)
        );
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.favorites.isLoading = false;
        state.favorites.error = action.error.message;
      })
      // Add to Favorites
      .addCase(addToFavorites.fulfilled, (state, action) => {
        const { contentId, contentType } = action.payload;
        state.favoriteIds.add(`${contentType}-${contentId}`);
        if (state.stats) {
          state.stats.total += 1;
          if (contentType === "movie") {
            state.stats.movies += 1;
          } else {
            state.stats.series += 1;
          }
        }
      })
      // Remove from Favorites
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        const { contentId, contentType } = action.payload;
        state.favoriteIds.delete(`${contentType}-${contentId}`);
        // Remove from data array if present
        state.favorites.data = state.favorites.data.filter(
          (item) => !(item.id === contentId && item.contentType === contentType)
        );
        if (state.stats) {
          state.stats.total -= 1;
          if (contentType === "movie") {
            state.stats.movies -= 1;
          } else {
            state.stats.series -= 1;
          }
        }
      })
      // Check Favorite
      .addCase(checkFavorite.fulfilled, (state, action) => {
        const { contentId, contentType, isFavorited } = action.payload;
        const key = `${contentType}-${contentId}`;
        if (isFavorited) {
          state.favoriteIds.add(key);
        } else {
          state.favoriteIds.delete(key);
        }
      })
      // Fetch Stats
      .addCase(fetchFavoriteStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearFavorites } = favoritesSlice.actions;

// Selectors
export const selectIsFavorited = (contentId, contentType) => (state) => {
  return state.favorites.favoriteIds.has(`${contentType}-${contentId}`);
};

export default favoritesSlice.reducer;

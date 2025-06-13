import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import contentService from "../../services/contentService";

const initialState = {
  results: [],
  pagination: null,
  isLoading: false,
  error: null,
  recentSearches: [],
  popularSearches: [],
};

// Async thunks
export const searchContent = createAsyncThunk(
  "search/searchContent",
  async ({ query, type = "all", page = 1 }) => {
    const response = await contentService.searchContent(query, { type, page });
    return { ...response, query };
  }
);

export const getPopularSearches = createAsyncThunk(
  "search/getPopularSearches",
  async () => {
    const response = await contentService.getPopularSearches();
    return response;
  }
);

export const advancedSearch = createAsyncThunk(
  "search/advancedSearch",
  async (filters) => {
    const response = await contentService.advancedSearch(filters);
    return response;
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.results = [];
      state.pagination = null;
      state.error = null;
    },
    addRecentSearch: (state, action) => {
      const query = action.payload;
      // Remove if already exists
      state.recentSearches = state.recentSearches.filter((s) => s !== query);
      // Add to beginning
      state.recentSearches.unshift(query);
      // Keep only last 10
      state.recentSearches = state.recentSearches.slice(0, 10);
      // Save to localStorage
      localStorage.setItem(
        "recentSearches",
        JSON.stringify(state.recentSearches)
      );
    },
    loadRecentSearches: (state) => {
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        state.recentSearches = JSON.parse(saved);
      }
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
      localStorage.removeItem("recentSearches");
    },
  },
  extraReducers: (builder) => {
    builder
      // Search Content
      .addCase(searchContent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchContent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload.results;
        state.pagination = action.payload.pagination;
        // Add to recent searches
        if (action.payload.query) {
          const query = action.payload.query;
          state.recentSearches = state.recentSearches.filter(
            (s) => s !== query
          );
          state.recentSearches.unshift(query);
          state.recentSearches = state.recentSearches.slice(0, 10);
          localStorage.setItem(
            "recentSearches",
            JSON.stringify(state.recentSearches)
          );
        }
      })
      .addCase(searchContent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        state.results = [];
        state.pagination = null;
      })
      // Popular Searches
      .addCase(getPopularSearches.fulfilled, (state, action) => {
        state.popularSearches = action.payload;
      })
      // Advanced Search
      .addCase(advancedSearch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(advancedSearch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload.results;
        state.pagination = action.payload.pagination;
      })
      .addCase(advancedSearch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        state.results = [];
        state.pagination = null;
      });
  },
});

export const {
  clearSearchResults,
  addRecentSearch,
  loadRecentSearches,
  clearRecentSearches,
} = searchSlice.actions;

export default searchSlice.reducer;

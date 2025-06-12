import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import contentService from "../../services/contentService";

const initialState = {
  movies: {
    data: [],
    pagination: null,
    isLoading: false,
    error: null,
  },
  series: {
    data: [],
    pagination: null,
    isLoading: false,
    error: null,
  },
  trending: {
    data: [],
    isLoading: false,
    error: null,
  },
  recommendations: {
    data: [],
    isLoading: false,
    error: null,
  },
  continueWatching: {
    data: [],
    isLoading: false,
    error: null,
  },
  currentMovie: null,
  currentSeries: null,
  genres: [],
  filters: {
    movies: {
      genre: "",
      year: "",
      sortBy: "popularity",
      order: "desc",
    },
    series: {
      genre: "",
      year: "",
      status: "",
      sortBy: "popularity",
      order: "desc",
    },
  },
};

// Async thunks
export const fetchMovies = createAsyncThunk(
  "content/fetchMovies",
  async ({ page = 1, ...filters }) => {
    const response = await contentService.getMovies({ page, ...filters });
    return response;
  }
);

export const fetchSeries = createAsyncThunk(
  "content/fetchSeries",
  async ({ page = 1, ...filters }) => {
    const response = await contentService.getSeries({ page, ...filters });
    return response;
  }
);

export const fetchTrending = createAsyncThunk(
  "content/fetchTrending",
  async ({ type = "all", timeWindow = "week" } = {}) => {
    const response = await contentService.getTrending(type, timeWindow);
    return response;
  }
);

export const fetchRecommendations = createAsyncThunk(
  "content/fetchRecommendations",
  async ({ type = "all", limit = 20 } = {}) => {
    const response = await contentService.getRecommendations(type, limit);
    return response;
  }
);

export const fetchContinueWatching = createAsyncThunk(
  "content/fetchContinueWatching",
  async () => {
    const response = await contentService.getContinueWatching();
    return response;
  }
);

export const fetchMovieById = createAsyncThunk(
  "content/fetchMovieById",
  async (id) => {
    const response = await contentService.getMovieById(id);
    return response;
  }
);

export const fetchSeriesById = createAsyncThunk(
  "content/fetchSeriesById",
  async (id) => {
    const response = await contentService.getSeriesById(id);
    return response;
  }
);

export const fetchGenres = createAsyncThunk("content/fetchGenres", async () => {
  const response = await contentService.getGenres();
  return response;
});

export const updateWatchProgress = createAsyncThunk(
  "content/updateWatchProgress",
  async ({ contentId, contentType, progress, totalDuration }) => {
    const response = await contentService.updateWatchHistory({
      contentId,
      contentType,
      progress,
      totalDuration,
    });
    return response;
  }
);

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    setMovieFilters: (state, action) => {
      state.filters.movies = { ...state.filters.movies, ...action.payload };
    },
    setSeriesFilters: (state, action) => {
      state.filters.series = { ...state.filters.series, ...action.payload };
    },
    clearCurrentMovie: (state) => {
      state.currentMovie = null;
    },
    clearCurrentSeries: (state) => {
      state.currentSeries = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Movies
      .addCase(fetchMovies.pending, (state) => {
        state.movies.isLoading = true;
        state.movies.error = null;
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.movies.isLoading = false;
        state.movies.data = action.payload.data;
        state.movies.pagination = action.payload.pagination;
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.movies.isLoading = false;
        state.movies.error = action.error.message;
      })
      // Fetch Series
      .addCase(fetchSeries.pending, (state) => {
        state.series.isLoading = true;
        state.series.error = null;
      })
      .addCase(fetchSeries.fulfilled, (state, action) => {
        state.series.isLoading = false;
        state.series.data = action.payload.data;
        state.series.pagination = action.payload.pagination;
      })
      .addCase(fetchSeries.rejected, (state, action) => {
        state.series.isLoading = false;
        state.series.error = action.error.message;
      })
      // Fetch Trending
      .addCase(fetchTrending.pending, (state) => {
        state.trending.isLoading = true;
        state.trending.error = null;
      })
      .addCase(fetchTrending.fulfilled, (state, action) => {
        state.trending.isLoading = false;
        state.trending.data = action.payload;
      })
      .addCase(fetchTrending.rejected, (state, action) => {
        state.trending.isLoading = false;
        state.trending.error = action.error.message;
      })
      // Fetch Recommendations
      .addCase(fetchRecommendations.pending, (state) => {
        state.recommendations.isLoading = true;
        state.recommendations.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendations.isLoading = false;
        state.recommendations.data = action.payload;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.recommendations.isLoading = false;
        state.recommendations.error = action.error.message;
      })
      // Fetch Continue Watching
      .addCase(fetchContinueWatching.pending, (state) => {
        state.continueWatching.isLoading = true;
        state.continueWatching.error = null;
      })
      .addCase(fetchContinueWatching.fulfilled, (state, action) => {
        state.continueWatching.isLoading = false;
        state.continueWatching.data = action.payload;
      })
      .addCase(fetchContinueWatching.rejected, (state, action) => {
        state.continueWatching.isLoading = false;
        state.continueWatching.error = action.error.message;
      })
      // Fetch Movie by ID
      .addCase(fetchMovieById.pending, (state) => {
        state.currentMovie = null;
      })
      .addCase(fetchMovieById.fulfilled, (state, action) => {
        state.currentMovie = action.payload;
      })
      // Fetch Series by ID
      .addCase(fetchSeriesById.pending, (state) => {
        state.currentSeries = null;
      })
      .addCase(fetchSeriesById.fulfilled, (state, action) => {
        state.currentSeries = action.payload;
      })
      // Fetch Genres
      .addCase(fetchGenres.fulfilled, (state, action) => {
        state.genres = action.payload;
      });
  },
});

export const {
  setMovieFilters,
  setSeriesFilters,
  clearCurrentMovie,
  clearCurrentSeries,
} = contentSlice.actions;

export default contentSlice.reducer;

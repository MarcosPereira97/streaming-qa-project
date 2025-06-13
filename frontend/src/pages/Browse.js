import React, { useEffect, useState } from "react";
import {
  fetchGenres,
  fetchMovies,
  fetchSeries,
  setMovieFilters,
  setSeriesFilters,
} from "../store/slices/contentSlice";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";

import ContentCard from "../components/Content/ContentCard";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import { motion } from "framer-motion";

const Browse = () => {
  const { type } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { movies, series, genres } = useSelector((state) => state.content);
  const [page, setPage] = useState(1);

  const isMovies = type === "movies";
  const content = isMovies ? movies : series;
  const filters = isMovies
    ? useSelector((state) => state.content.filters.movies)
    : useSelector((state) => state.content.filters.series);

  useEffect(() => {
    dispatch(fetchGenres());
  }, [dispatch]);

  useEffect(() => {
    // Get filters from URL params
    const genre = searchParams.get("genre") || "";
    const year = searchParams.get("year") || "";
    const sortBy = searchParams.get("sortBy") || "popularity";
    const order = searchParams.get("order") || "desc";

    if (isMovies) {
      dispatch(setMovieFilters({ genre, year, sortBy, order }));
      dispatch(fetchMovies({ page, genre, year, sortBy, order }));
    } else {
      const status = searchParams.get("status") || "";
      dispatch(setSeriesFilters({ genre, year, status, sortBy, order }));
      dispatch(fetchSeries({ page, genre, year, status, sortBy, order }));
    }
  }, [dispatch, isMovies, page, searchParams]);

  const handleFilterChange = (filterType, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(filterType, value);
    } else {
      newParams.delete(filterType);
    }
    setSearchParams(newParams);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4" data-test="browse-title">
            {isMovies ? "Movies" : "TV Series"}
          </h1>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Genre Filter */}
            <select
              value={filters.genre}
              onChange={(e) => handleFilterChange("genre", e.target.value)}
              className="bg-dark-800 border border-dark-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              data-test="genre-filter"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.name}>
                  {genre.name}
                </option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange("year", e.target.value)}
              className="bg-dark-800 border border-dark-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              data-test="year-filter"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {/* Status Filter (Series only) */}
            {!isMovies && (
              <select
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="bg-dark-800 border border-dark-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                data-test="status-filter"
              >
                <option value="">All Status</option>
                <option value="Returning Series">Returning Series</option>
                <option value="Ended">Ended</option>
                <option value="Canceled">Canceled</option>
                <option value="In Production">In Production</option>
              </select>
            )}

            {/* Sort By */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="bg-dark-800 border border-dark-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              data-test="sort-filter"
            >
              <option value="popularity">Popularity</option>
              <option value={isMovies ? "release_date" : "first_air_date"}>
                {isMovies ? "Release Date" : "Air Date"}
              </option>
              <option value="imdb_rating">IMDB Rating</option>
              <option value="title">Title</option>
            </select>

            {/* Order */}
            <select
              value={filters.order}
              onChange={(e) => handleFilterChange("order", e.target.value)}
              className="bg-dark-800 border border-dark-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              data-test="order-filter"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Content Grid */}
        {content.isLoading && page === 1 ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="large" />
          </div>
        ) : content.data.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {content.data.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ContentCard content={item} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {content.pagination && content.pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || content.isLoading}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    data-test="prev-page"
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    <span className="px-4 py-2 text-gray-400">
                      Page {page} of {content.pagination.totalPages}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={
                      page === content.pagination.totalPages ||
                      content.isLoading
                    }
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    data-test="next-page"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <svg
              className="w-24 h-24 mx-auto text-gray-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4"
              />
            </svg>
            <h2 className="text-2xl font-semibold mb-2">No content found</h2>
            <p className="text-gray-400">
              Try adjusting your filters to see more results
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;

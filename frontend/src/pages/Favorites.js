import React, { useEffect, useState } from "react";
import {
  fetchFavoriteStats,
  fetchFavorites,
} from "../store/slices/favoritesSlice";
import { useDispatch, useSelector } from "react-redux";

import ContentCard from "../components/Content/ContentCard";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import { motion } from "framer-motion";

const Favorites = () => {
  const dispatch = useDispatch();
  const { favorites, stats } = useSelector((state) => state.favorites);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchFavorites({ page, type: filter === "all" ? undefined : filter })
    );
    dispatch(fetchFavoriteStats());
  }, [dispatch, page, filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleLoadMore = () => {
    setPage(page + 1);
    dispatch(
      fetchFavorites({
        page: page + 1,
        type: filter === "all" ? undefined : filter,
      })
    );
  };

  if (favorites.isLoading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4" data-test="favorites-title">
            My Favorites
          </h1>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-dark-900 rounded-lg p-4 text-center"
              >
                <p className="text-3xl font-bold text-primary-500">
                  {stats.total}
                </p>
                <p className="text-gray-400">Total Favorites</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-dark-900 rounded-lg p-4 text-center"
              >
                <p className="text-3xl font-bold text-blue-500">
                  {stats.movies}
                </p>
                <p className="text-gray-400">Movies</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-dark-900 rounded-lg p-4 text-center"
              >
                <p className="text-3xl font-bold text-green-500">
                  {stats.series}
                </p>
                <p className="text-gray-400">Series</p>
              </motion.div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {["all", "movie", "series"].map((type) => (
              <button
                key={type}
                onClick={() => handleFilterChange(type)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  filter === type
                    ? "bg-primary-600 text-white"
                    : "bg-dark-800 text-gray-300 hover:bg-dark-700"
                }`}
                data-test={`filter-${type}`}
              >
                {type === "all"
                  ? "All"
                  : type === "movie"
                  ? "Movies"
                  : "Series"}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        {favorites.data.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {favorites.data.map((content) => (
                <ContentCard
                  key={`${content.contentType}-${content.id}`}
                  content={content}
                />
              ))}
            </div>

            {/* Load More */}
            {favorites.pagination && page < favorites.pagination.totalPages && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={favorites.isLoading}
                  className="btn-secondary"
                  data-test="load-more-button"
                >
                  {favorites.isLoading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    "Load More"
                  )}
                </button>
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h2 className="text-2xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-gray-400 mb-6">
              Start adding movies and series to your favorites list
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="btn-primary"
              data-test="browse-content-button"
            >
              Browse Content
            </button>
          </div>
        )}

        {/* Top Genres */}
        {stats && stats.topGenres && stats.topGenres.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Your Top Genres</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats.topGenres.map((genre, index) => (
                <motion.div
                  key={genre.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-dark-900 rounded-lg p-4 text-center"
                >
                  <p className="font-semibold">{genre.name}</p>
                  <p className="text-gray-400 text-sm">{genre.count} titles</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;

import React, { useEffect, useState } from "react";
import { clearSearchResults, searchContent } from "../store/slices/searchSlice";
import { useDispatch, useSelector } from "react-redux";

import ContentCard from "../components/Content/ContentCard";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";

const Search = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { results, isLoading, pagination } = useSelector(
    (state) => state.search
  );
  const [filters, setFilters] = useState({
    type: "all",
    sortBy: "relevance",
  });

  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    if (query) {
      dispatch(
        searchContent({
          query,
          type: filters.type,
          page,
        })
      );
    }

    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch, query, page, filters.type]);

  const handleFilterChange = (filterType, value) => {
    setFilters({ ...filters, [filterType]: value });
    setSearchParams({ q: query, page: "1" });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ q: query, page: newPage.toString() });
  };

  if (!query) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h2 className="text-2xl font-semibold mb-2">Search for content</h2>
          <p className="text-gray-400">
            Use the search bar to find movies and series
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-test="search-title">
            Search Results
          </h1>
          <p className="text-gray-400">
            {pagination?.total || 0} results for "{query}"
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-400">Type:</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="bg-dark-800 border border-dark-700 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
              data-test="type-filter"
            >
              <option value="all">All</option>
              <option value="movie">Movies</option>
              <option value="series">Series</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {isLoading && page === 1 ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="large" />
          </div>
        ) : results.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {results.map((content, index) => (
                <motion.div
                  key={`${content.content_type}-${content.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ContentCard content={content} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    data-test="prev-page"
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {[...Array(Math.min(5, pagination.totalPages))].map(
                      (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 rounded ${
                              pageNum === page
                                ? "bg-primary-600 text-white"
                                : "bg-dark-800 text-gray-300 hover:bg-dark-700"
                            }`}
                            data-test={`page-${pageNum}`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === pagination.totalPages}
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
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-semibold mb-2">No results found</h2>
            <p className="text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;

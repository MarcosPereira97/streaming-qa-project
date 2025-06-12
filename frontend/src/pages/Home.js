import React, { useEffect } from "react";
import {
  fetchContinueWatching,
  fetchRecommendations,
  fetchTrending,
} from "../store/slices/contentSlice";
import { useDispatch, useSelector } from "react-redux";

import ContentCarousel from "../components/Content/ContentCarousel";
import HeroSection from "../components/Home/HeroSection";
import LoadingSpinner from "../components/UI/LoadingSpinner";

const Home = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { trending, recommendations, continueWatching } = useSelector(
    (state) => state.content
  );

  useEffect(() => {
    // Fetch trending content
    dispatch(fetchTrending({ type: "all", timeWindow: "week" }));

    // Fetch recommendations
    dispatch(fetchRecommendations({ type: "all", limit: 20 }));

    // Fetch continue watching if authenticated
    if (isAuthenticated) {
      dispatch(fetchContinueWatching());
    }
  }, [dispatch, isAuthenticated]);

  if (trending.isLoading && trending.data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {trending.data.length > 0 && <HeroSection content={trending.data[0]} />}

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Continue Watching */}
        {isAuthenticated && continueWatching.data.length > 0 && (
          <section data-test="continue-watching-section">
            <ContentCarousel
              title="Continue Watching"
              content={continueWatching.data}
              isLoading={continueWatching.isLoading}
              showProgress
            />
          </section>
        )}

        {/* Trending Now */}
        <section data-test="trending-section">
          <ContentCarousel
            title="Trending Now"
            content={trending.data}
            isLoading={trending.isLoading}
          />
        </section>

        {/* Recommendations */}
        {recommendations.data.length > 0 && (
          <section data-test="recommendations-section">
            <ContentCarousel
              title={
                isAuthenticated
                  ? "Recommended for You"
                  : "Popular on StreamFlix"
              }
              content={recommendations.data}
              isLoading={recommendations.isLoading}
            />
          </section>
        )}

        {/* Browse by Category */}
        <section className="py-8" data-test="browse-categories">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { name: "Action", gradient: "from-red-600 to-orange-600" },
              { name: "Comedy", gradient: "from-yellow-600 to-green-600" },
              { name: "Drama", gradient: "from-blue-600 to-indigo-600" },
              { name: "Horror", gradient: "from-purple-600 to-pink-600" },
              { name: "Sci-Fi", gradient: "from-cyan-600 to-blue-600" },
              { name: "Romance", gradient: "from-pink-600 to-red-600" },
              { name: "Thriller", gradient: "from-gray-600 to-gray-800" },
              { name: "Documentary", gradient: "from-green-600 to-teal-600" },
            ].map((genre) => (
              <button
                key={genre.name}
                onClick={() =>
                  (window.location.href = `/browse/movies?genre=${genre.name}`)
                }
                className={`relative h-24 rounded-lg bg-gradient-to-br ${genre.gradient} p-4 flex items-center justify-center text-white font-semibold text-lg hover:scale-105 transition-transform duration-200 shadow-lg`}
                data-test={`genre-${genre.name.toLowerCase()}`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;

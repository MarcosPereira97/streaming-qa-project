import "react-lazy-load-image-component/src/effects/blur.css";

import React, { useEffect } from "react";
import {
  addToFavorites,
  removeFromFavorites,
  selectIsFavorited,
} from "../store/slices/favoritesSlice";
import {
  clearCurrentSeries,
  fetchSeriesById,
} from "../store/slices/contentSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import ContentCarousel from "../components/Content/ContentCarousel";
import { LazyLoadImage } from "react-lazy-load-image-component";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import { motion } from "framer-motion";

const SeriesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentSeries } = useSelector((state) => state.content);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isFavorited = useSelector(selectIsFavorited(id, "series"));

  useEffect(() => {
    dispatch(fetchSeriesById(id));

    return () => {
      dispatch(clearCurrentSeries());
    };
  }, [dispatch, id]);

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (isFavorited) {
      dispatch(removeFromFavorites({ contentId: id, contentType: "series" }));
    } else {
      dispatch(addToFavorites({ contentId: id, contentType: "series" }));
    }
  };

  const handlePlayClick = () => {
    // In a real app, this would start video playback
    console.log("Play series:", id);
  };

  if (!currentSeries) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const releaseYear = new Date(currentSeries.first_air_date).getFullYear();
  const lastYear = currentSeries.last_air_date
    ? new Date(currentSeries.last_air_date).getFullYear()
    : null;
  const yearRange =
    lastYear && lastYear !== releaseYear
      ? `${releaseYear} - ${lastYear}`
      : releaseYear.toString();

  // TMDB image base URL
  const imageBaseUrl = "https://image.tmdb.org/t/p/";
  const backdropUrl = currentSeries.backdrop_path
    ? `${imageBaseUrl}original${currentSeries.backdrop_path}`
    : null;
  const posterUrl = currentSeries.poster_path
    ? `${imageBaseUrl}w500${currentSeries.poster_path}`
    : "/placeholder-poster.jpg";

  const statusColor = {
    "Returning Series": "text-green-500",
    Ended: "text-red-500",
    Canceled: "text-red-500",
    "In Production": "text-blue-500",
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh]">
        {backdropUrl ? (
          <LazyLoadImage
            src={backdropUrl}
            alt={currentSeries.title}
            effect="blur"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-dark-800 to-dark-900" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/70 to-transparent" />

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayClick}
            className="p-6 bg-primary-600/80 rounded-full hover:bg-primary-600 transition-colors"
            data-test="play-button"
          >
            <svg
              className="w-16 h-16 text-white ml-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Poster & Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Poster */}
              <div className="hidden lg:block mb-6">
                <LazyLoadImage
                  src={posterUrl}
                  alt={currentSeries.title}
                  effect="blur"
                  className="w-full rounded-lg shadow-xl"
                />
              </div>

              {/* Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Years</h3>
                  <p className="font-semibold">{yearRange}</p>
                </div>

                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Status</h3>
                  <p
                    className={`font-semibold ${
                      statusColor[currentSeries.status] || "text-gray-300"
                    }`}
                  >
                    {currentSeries.status}
                  </p>
                </div>

                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Seasons</h3>
                  <p className="font-semibold">
                    {currentSeries.number_of_seasons || "N/A"}
                  </p>
                </div>

                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Episodes</h3>
                  <p className="font-semibold">
                    {currentSeries.number_of_episodes || "N/A"}
                  </p>
                </div>

                {currentSeries.creators &&
                  currentSeries.creators.length > 0 && (
                    <div>
                      <h3 className="text-gray-400 text-sm mb-1">Created by</h3>
                      <p className="font-semibold">
                        {currentSeries.creators.map((c) => c.name).join(", ")}
                      </p>
                    </div>
                  )}

                {currentSeries.genres && currentSeries.genres.length > 0 && (
                  <div>
                    <h3 className="text-gray-400 text-sm mb-1">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentSeries.genres.map((genre) => (
                        <span
                          key={genre.id}
                          className="px-3 py-1 bg-dark-800 rounded-full text-sm"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {currentSeries.networks &&
                  currentSeries.networks.length > 0 && (
                    <div>
                      <h3 className="text-gray-400 text-sm mb-1">Networks</h3>
                      <p className="font-semibold">
                        {currentSeries.networks.map((n) => n.name).join(", ")}
                      </p>
                    </div>
                  )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Title & Actions */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                <div>
                  <h1
                    className="text-3xl md:text-4xl font-bold mb-2"
                    data-test="series-title"
                  >
                    {currentSeries.title}
                  </h1>
                  {currentSeries.original_title !== currentSeries.title && (
                    <p className="text-gray-400 mb-4">
                      {currentSeries.original_title}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleFavoriteClick}
                    className="btn-secondary flex items-center space-x-2"
                    data-test="favorite-button"
                  >
                    <svg
                      className={`w-5 h-5 ${
                        isFavorited ? "text-red-500 fill-current" : ""
                      }`}
                      fill={isFavorited ? "currentColor" : "none"}
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
                    <span>
                      {isFavorited ? "Favorited" : "Add to Favorites"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Rating */}
              {currentSeries.imdb_rating && (
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-6 h-6 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xl font-semibold">
                      {currentSeries.imdb_rating.toFixed(1)}
                    </span>
                    <span className="text-gray-400">IMDB</span>
                  </div>
                </div>
              )}

              {/* Overview */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Overview</h2>
                <p
                  className="text-gray-300 leading-relaxed"
                  data-test="series-overview"
                >
                  {currentSeries.overview}
                </p>
              </div>

              {/* Cast */}
              {currentSeries.cast_members &&
                currentSeries.cast_members.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Cast</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {currentSeries.cast_members.slice(0, 8).map((actor) => (
                        <div key={actor.id} className="text-sm">
                          <p className="font-medium">{actor.name}</p>
                          <p className="text-gray-400">{actor.character}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </motion.div>
          </div>
        </div>

        {/* Similar Series */}
        {currentSeries.similar && currentSeries.similar.length > 0 && (
          <div className="mt-12">
            <ContentCarousel
              title="Similar Series"
              content={currentSeries.similar}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesDetail;

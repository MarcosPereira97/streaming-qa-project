import "react-lazy-load-image-component/src/effects/blur.css";

import React, { useEffect } from "react";
import {
  addToFavorites,
  removeFromFavorites,
  selectIsFavorited,
} from "../store/slices/favoritesSlice";
import {
  clearCurrentMovie,
  fetchMovieById,
} from "../store/slices/contentSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import ContentCarousel from "../components/Content/ContentCarousel";
import { LazyLoadImage } from "react-lazy-load-image-component";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import { motion } from "framer-motion";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentMovie } = useSelector((state) => state.content);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isFavorited = useSelector(selectIsFavorited(id, "movie"));

  useEffect(() => {
    dispatch(fetchMovieById(id));

    return () => {
      dispatch(clearCurrentMovie());
    };
  }, [dispatch, id]);

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (isFavorited) {
      dispatch(removeFromFavorites({ contentId: id, contentType: "movie" }));
    } else {
      dispatch(addToFavorites({ contentId: id, contentType: "movie" }));
    }
  };

  const handlePlayClick = () => {
    // In a real app, this would start video playback
    console.log("Play movie:", id);
  };

  if (!currentMovie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const releaseYear = new Date(currentMovie.release_date).getFullYear();
  const runtime = currentMovie.runtime
    ? `${Math.floor(currentMovie.runtime / 60)}h ${currentMovie.runtime % 60}m`
    : "N/A";

  // TMDB image base URL
  const imageBaseUrl = "https://image.tmdb.org/t/p/";
  const backdropUrl = currentMovie.backdrop_path
    ? `${imageBaseUrl}original${currentMovie.backdrop_path}`
    : null;
  const posterUrl = currentMovie.poster_path
    ? `${imageBaseUrl}w500${currentMovie.poster_path}`
    : "/placeholder-poster.jpg";

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh]">
        {backdropUrl ? (
          <LazyLoadImage
            src={backdropUrl}
            alt={currentMovie.title}
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
                  alt={currentMovie.title}
                  effect="blur"
                  className="w-full rounded-lg shadow-xl"
                />
              </div>

              {/* Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Release Year</h3>
                  <p className="font-semibold">{releaseYear}</p>
                </div>

                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Runtime</h3>
                  <p className="font-semibold">{runtime}</p>
                </div>

                {currentMovie.director && (
                  <div>
                    <h3 className="text-gray-400 text-sm mb-1">Director</h3>
                    <p className="font-semibold">{currentMovie.director}</p>
                  </div>
                )}

                {currentMovie.genres && currentMovie.genres.length > 0 && (
                  <div>
                    <h3 className="text-gray-400 text-sm mb-1">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentMovie.genres.map((genre) => (
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

                {currentMovie.production_companies &&
                  currentMovie.production_companies.length > 0 && (
                    <div>
                      <h3 className="text-gray-400 text-sm mb-1">Production</h3>
                      <p className="font-semibold">
                        {currentMovie.production_companies
                          .slice(0, 2)
                          .map((c) => c.name)
                          .join(", ")}
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
                    data-test="movie-title"
                  >
                    {currentMovie.title}
                  </h1>
                  {currentMovie.original_title !== currentMovie.title && (
                    <p className="text-gray-400 mb-4">
                      {currentMovie.original_title}
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
              {currentMovie.imdb_rating && (
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
                      {currentMovie.imdb_rating.toFixed(1)}
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
                  data-test="movie-overview"
                >
                  {currentMovie.overview}
                </p>
              </div>

              {/* Cast */}
              {currentMovie.cast_members &&
                currentMovie.cast_members.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-3">Cast</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {currentMovie.cast_members.slice(0, 8).map((actor) => (
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

        {/* Similar Movies */}
        {currentMovie.similar && currentMovie.similar.length > 0 && (
          <div className="mt-12">
            <ContentCarousel
              title="Similar Movies"
              content={currentMovie.similar}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;

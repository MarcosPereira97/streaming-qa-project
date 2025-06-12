import "react-lazy-load-image-component/src/effects/blur.css";

import {
  addToFavorites,
  removeFromFavorites,
  selectIsFavorited,
} from "../../store/slices/favoritesSlice";
import { useDispatch, useSelector } from "react-redux";

import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import React from "react";
import { motion } from "framer-motion";

const ContentCard = ({ content, showProgress = false }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isFavorited = useSelector(
    selectIsFavorited(content.id, content.contentType || content.content_type)
  );

  const isMovie = (content.contentType || content.content_type) === "movie";
  const releaseYear = new Date(
    content.release_date ||
      content.first_air_date ||
      content.releaseDate ||
      content.firstAirDate
  ).getFullYear();

  // TMDB image base URL
  const imageBaseUrl = "https://image.tmdb.org/t/p/";
  const posterUrl =
    content.poster_path || content.posterPath
      ? `${imageBaseUrl}w500${content.poster_path || content.posterPath}`
      : "/placeholder-poster.jpg";

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = "/login";
      return;
    }

    if (isFavorited) {
      dispatch(
        removeFromFavorites({
          contentId: content.id,
          contentType: content.contentType || content.content_type,
        })
      );
    } else {
      dispatch(
        addToFavorites({
          contentId: content.id,
          contentType: content.contentType || content.content_type,
        })
      );
    }
  };

  const progressPercentage =
    showProgress && content.progress && content.totalDuration
      ? (content.progress / content.totalDuration) * 100
      : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
      className="content-card relative"
    >
      <Link
        to={`/${isMovie ? "movie" : "series"}/${content.id}`}
        className="block relative group"
        data-test={`content-card-${content.id}`}
      >
        {/* Poster Image */}
        <div className="relative aspect-poster overflow-hidden rounded-lg bg-dark-800">
          <LazyLoadImage
            src={posterUrl}
            alt={content.title}
            effect="blur"
            className="w-full h-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-2 bg-dark-900/80 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-dark-800"
            data-test="favorite-button"
          >
            <svg
              className={`w-5 h-5 transition-colors ${
                isFavorited ? "text-red-500 fill-current" : "text-white"
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
          </button>

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="p-3 bg-primary-600 rounded-full">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Progress Bar */}
          {showProgress && progressPercentage > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-700">
              <div
                className="h-full bg-primary-600 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="mt-3 space-y-1">
          <h3 className="font-semibold line-clamp-1" data-test="content-title">
            {content.title}
          </h3>
          <div className="flex items-center text-sm text-gray-400 space-x-2">
            <span>{releaseYear || "N/A"}</span>
            {content.imdb_rating && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <svg
                    className="w-4 h-4 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>
                    {(content.imdb_rating || content.imdbRating)?.toFixed(1)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ContentCard;

import "react-lazy-load-image-component/src/effects/blur.css";

import { LazyLoadImage } from "react-lazy-load-image-component";
import { Link } from "react-router-dom";
import React from "react";
import { motion } from "framer-motion";

const HeroSection = ({ content }) => {
  if (!content) return null;

  const isMovie = content.content_type === "movie";
  const releaseYear = new Date(
    content.release_date || content.first_air_date
  ).getFullYear();

  // TMDB image base URL
  const imageBaseUrl = "https://image.tmdb.org/t/p/";
  const backdropUrl = content.backdrop_path
    ? `${imageBaseUrl}original${content.backdrop_path}`
    : null;

  return (
    <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {backdropUrl ? (
          <LazyLoadImage
            src={backdropUrl}
            alt={content.title}
            effect="blur"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-dark-800 to-dark-900" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          {/* Title */}
          <h1
            className="text-4xl md:text-6xl font-bold mb-4"
            data-test="hero-title"
          >
            {content.title}
          </h1>

          {/* Metadata */}
          <div className="flex items-center space-x-4 text-sm md:text-base mb-6">
            <span className="text-primary-400 font-semibold">
              {isMovie ? "Movie" : "Series"}
            </span>
            <span className="text-gray-400">{releaseYear}</span>
            {content.imdb_rating && (
              <>
                <span className="text-gray-400">•</span>
                <div className="flex items-center space-x-1">
                  <svg
                    className="w-5 h-5 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-white font-medium">
                    {content.imdb_rating.toFixed(1)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Overview */}
          <p
            className="text-gray-300 text-lg mb-8 line-clamp-3"
            data-test="hero-overview"
          >
            {content.overview}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <Link
              to={`/${isMovie ? "movie" : "series"}/${content.id}`}
              className="btn-primary flex items-center space-x-2"
              data-test="hero-play-button"
            >
              <svg
                className="w-5 h-5"
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
              <span>Watch Now</span>
            </Link>

            <Link
              to={`/${isMovie ? "movie" : "series"}/${content.id}`}
              className="btn-secondary flex items-center space-x-2"
              data-test="hero-info-button"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>More Info</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

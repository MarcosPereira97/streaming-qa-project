import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { A11y, Navigation, Pagination } from "swiper/modules";
import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import ContentCard from "./contentCard";
import ContentCardSkeleton from "./ContentCardSkeleton";

const ContentCarousel = ({
  title,
  content,
  isLoading,
  showProgress = false,
}) => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  if (!content && !isLoading) return null;

  return (
    <div className="relative">
      {title && (
        <h2
          className="text-2xl font-bold mb-4"
          data-test={`carousel-title-${title}`}
        >
          {title}
        </h2>
      )}

      <div className="relative group">
        {/* Custom Navigation Buttons */}
        <button
          ref={prevRef}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-dark-900/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-dark-800 -translate-x-4"
          aria-label="Previous"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          ref={nextRef}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-dark-900/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-dark-800 translate-x-4"
          aria-label="Next"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Carousel */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <ContentCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <Swiper
            modules={[Navigation, Pagination, A11y]}
            spaceBetween={16}
            slidesPerView={2}
            slidesPerGroup={2}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            breakpoints={{
              640: {
                slidesPerView: 3,
                slidesPerGroup: 3,
              },
              768: {
                slidesPerView: 4,
                slidesPerGroup: 4,
              },
              1024: {
                slidesPerView: 5,
                slidesPerGroup: 5,
              },
              1280: {
                slidesPerView: 6,
                slidesPerGroup: 6,
              },
            }}
            className="content-carousel"
          >
            {content.map((item, index) => (
              <SwiperSlide key={item.id || index}>
                <ContentCard content={item} showProgress={showProgress} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
};

export default ContentCarousel;

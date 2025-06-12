import React from "react";

const LoadingSpinner = ({ size = "medium", className = "" }) => {
  const sizeClasses = {
    small: "w-5 h-5",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-dark-700 border-t-primary-500`}
        data-test="loading-spinner"
      />
    </div>
  );
};

export default LoadingSpinner;

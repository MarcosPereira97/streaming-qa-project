import React from "react";

const ContentCardSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="aspect-poster bg-dark-800 rounded-lg skeleton" />
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-dark-800 rounded skeleton" />
        <div className="h-3 bg-dark-800 rounded w-2/3 skeleton" />
      </div>
    </div>
  );
};

export default ContentCardSkeleton;

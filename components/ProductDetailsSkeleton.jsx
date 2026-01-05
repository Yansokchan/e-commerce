"use client";

const ProductDetailsSkeleton = () => {
  return (
    <div className="flex max-lg:flex-col gap-12 animate-pulse">
      <div className="flex max-sm:flex-col-reverse gap-3">
        {/* Thumbnails Skeleton */}
        <div className="flex sm:flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 size-26 rounded-lg"></div>
          ))}
        </div>
        {/* Main Image Skeleton */}
        <div className="h-100 sm:size-113 bg-gray-200 rounded-lg"></div>
      </div>

      <div className="flex-1 space-y-6">
        {/* Title Skeleton */}
        <div className="h-10 w-3/4 bg-gray-200 rounded"></div>

        {/* Stock Status Skeleton */}
        <div className="h-4 w-24 bg-gray-200 rounded"></div>

        {/* Description Skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
          <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
        </div>

        {/* Price Skeleton */}
        <div className="flex gap-3">
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
        </div>

        {/* Button Skeleton */}
        <div className="h-12 w-40 bg-gray-200 rounded"></div>

        <hr className="border-gray-200" />

        {/* Features Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="size-6 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-48 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;

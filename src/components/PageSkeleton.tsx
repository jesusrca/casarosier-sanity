export function PageSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Hero Skeleton */}
      <div className="h-[65vh] min-h-[500px] bg-gray-200"></div>

      {/* Content Skeleton */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 lg:gap-16">
            {/* Image Gallery Skeleton */}
            <div className="space-y-6">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-6 bg-gray-200 rounded w-full"></div>
                <div className="h-6 bg-gray-200 rounded w-5/6"></div>
                <div className="h-6 bg-gray-200 rounded w-4/6"></div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                  <div className="h-6 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-6 bg-gray-200 rounded w-4/6"></div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 h-12 bg-gray-200 rounded"></div>
                  <div className="flex-1 h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

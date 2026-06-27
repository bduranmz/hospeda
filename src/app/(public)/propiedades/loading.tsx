import { Skeleton } from "@/components/ui/Skeleton";

function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Image placeholder */}
      <Skeleton className="w-full aspect-[4/3]" rounded="none" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Location */}
        <Skeleton className="h-3 w-24" rounded="full" />

        {/* Title */}
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full" rounded="md" />
          <Skeleton className="h-4 w-3/4" rounded="md" />
        </div>

        {/* Space type */}
        <Skeleton className="h-3 w-32" rounded="full" />

        {/* Details row */}
        <div className="flex items-center gap-3 pt-1">
          <Skeleton className="h-3 w-10" rounded="full" />
          <Skeleton className="h-3 w-10" rounded="full" />
          <Skeleton className="h-3 w-10" rounded="full" />
        </div>

        {/* Price + rating */}
        <div className="flex items-end justify-between pt-3 border-t border-gray-50">
          <Skeleton className="h-6 w-28" rounded="md" />
          <Skeleton className="h-4 w-16" rounded="full" />
        </div>
      </div>
    </div>
  );
}

function FilterBarSkeleton() {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Skeleton className="h-9 w-36" rounded="lg" />
      <Skeleton className="h-9 w-28" rounded="lg" />
      <Skeleton className="h-9 w-32" rounded="lg" />
      <Skeleton className="h-9 w-24" rounded="lg" />
    </div>
  );
}

export default function PropiedadesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header skeleton */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-56" rounded="lg" />
        <Skeleton className="h-4 w-40" rounded="md" />
      </div>

      {/* Filter bar skeleton */}
      <div className="mb-6">
        <FilterBarSkeleton />
      </div>

      {/* Grid of 8 skeleton cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

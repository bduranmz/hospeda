import { Skeleton } from "@/components/ui/Skeleton";

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      {/* Icon */}
      <Skeleton className="w-8 h-8 mb-3" rounded="lg" />
      {/* Value */}
      <Skeleton className="h-7 w-16 mb-2" rounded="md" />
      {/* Label */}
      <Skeleton className="h-3 w-32" rounded="full" />
    </div>
  );
}

function ActivityRowSkeleton() {
  return (
    <div className="flex items-start gap-4 px-6 py-4">
      {/* Icon */}
      <Skeleton className="w-5 h-5 mt-0.5 shrink-0" rounded="full" />
      {/* Content */}
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-36" rounded="md" />
        <Skeleton className="h-3 w-52" rounded="full" />
      </div>
      {/* Time */}
      <Skeleton className="h-3 w-16 mt-0.5 shrink-0" rounded="full" />
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <main className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-7 w-64" rounded="lg" />
        <Skeleton className="h-4 w-48" rounded="md" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* CTA banner skeleton */}
      <div className="mb-8">
        <Skeleton className="h-36 w-full" rounded="xl" />
      </div>

      {/* Activity list */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <Skeleton className="h-5 w-36" rounded="md" />
          <Skeleton className="h-4 w-16" rounded="full" />
        </div>
        {/* Rows */}
        <ul className="divide-y divide-gray-50">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i}>
              <ActivityRowSkeleton />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 space-y-12">
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4 max-w-lg" />
        <Skeleton className="h-6 w-full max-w-2xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

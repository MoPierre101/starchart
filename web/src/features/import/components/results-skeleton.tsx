import { Skeleton } from "@/components/ui/skeleton";

type ResultsSkeletonProps = {
  count?: number;
};

export function ResultsSkeleton({ count = 6 }: ResultsSkeletonProps) {
  return (
    <div
      aria-hidden
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
    >
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="aspect-2/3 w-full rounded-xl" />
      ))}
    </div>
  );
}

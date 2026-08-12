interface SkeletonProps {
  className?: string;
}

/** Animated shimmer skeleton for loading states. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-shimmer rounded-md ${className}`} />;
}

/** Skeleton for a stat card. */
export function StatCardSkeleton() {
  return (
    <div className="bg-bg-card rounded-xl border border-border-default p-4">
      <Skeleton className="h-10 w-16 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

/** Skeleton for a problem table row. */
export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border-default">
      <Skeleton className="h-4 w-4 shrink-0" />
      <Skeleton className="h-4 w-8 shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <Skeleton className="h-5 w-24 shrink-0 hidden sm:block" />
      <Skeleton className="h-5 w-16 shrink-0" />
      <div className="flex gap-2 shrink-0">
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-7 w-7 rounded-md" />
      </div>
    </div>
  );
}

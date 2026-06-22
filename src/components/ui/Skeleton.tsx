export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`skeleton-shimmer rounded-lg bg-slate-800/70 ${className}`}
    />
  );
}

export function PostSkeleton() {
  return (
    <div className="app-surface mx-4 my-4 flex gap-4 rounded-2xl p-5">
      <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-3 w-44" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="flex gap-3 pt-1">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

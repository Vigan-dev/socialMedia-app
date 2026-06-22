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

export function ListItemSkeleton({ lines = 2 }: { lines?: 1 | 2 | 3 }) {
  return (
    <div className="app-surface flex gap-3 rounded-2xl p-4">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3 w-2/5" />
        {Array.from({ length: lines }, (_, index) => (
          <Skeleton
            key={index}
            className={index === lines - 1 ? 'h-3 w-3/5' : 'h-3 w-full'}
          />
        ))}
      </div>
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-start">
        <Skeleton className="h-11 w-2/3 rounded-2xl" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-11 w-1/2 rounded-2xl" />
      </div>
      <div className="flex justify-start">
        <Skeleton className="h-16 w-3/4 rounded-2xl" />
      </div>
    </div>
  );
}

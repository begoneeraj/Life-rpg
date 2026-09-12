/** Generic shimmering placeholder block used while data is loading, instead of a bare spinner. */
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gradient-to-r from-dungeon-800 via-dungeon-700 to-dungeon-800 bg-[length:200%_100%] ${className}`}
      aria-hidden="true"
    />
  );
}

export function QuestCardSkeleton() {
  return (
    <div className="parchment-card flex items-center justify-between gap-4 p-4">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-8 w-24" />
    </div>
  );
}

export function ShopItemSkeleton() {
  return (
    <div className="parchment-card space-y-3 p-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

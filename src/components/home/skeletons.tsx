import { cn } from "@/lib/utils";

function Pulse({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-200/80", className)} />;
}

export function FeaturedBusinessesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <Pulse className="h-28 w-full rounded-none" />
          <div className="space-y-3 p-4 pt-8">
            <Pulse className="h-4 w-2/3" />
            <Pulse className="h-3 w-1/2" />
            <Pulse className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EventsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <Pulse className="h-24 w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Pulse className="h-4 w-3/4" />
            <Pulse className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: 12 }).map((_, index) => (
        <Pulse key={index} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

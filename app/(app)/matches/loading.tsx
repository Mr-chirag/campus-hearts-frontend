import { Skeleton } from "@/components/ui/Skeleton";

export default function MatchesLoading() {
  return (
    <div className="px-3 py-3 lg:w-[380px] lg:px-4 lg:py-6">
      <Skeleton className="mb-4 hidden h-8 w-32 lg:block" />
      <ul className="space-y-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 px-3 py-3">
            <Skeleton className="size-14 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

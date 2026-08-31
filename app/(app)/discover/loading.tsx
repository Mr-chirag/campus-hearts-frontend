import { Skeleton } from "@/components/ui/Skeleton";

export default function DiscoverLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-4 lg:px-8 lg:py-8">
      <Skeleton className="mb-6 hidden h-9 w-40 lg:block" />
      <div className="mx-auto w-full max-w-[420px]">
        <Skeleton className="aspect-[3/4] w-full rounded-card" />
        <div className="mt-6 flex items-center justify-center gap-4">
          <Skeleton className="size-14 rounded-full" />
          <Skeleton className="size-12 rounded-full" />
          <Skeleton className="size-14 rounded-full" />
        </div>
      </div>
    </main>
  );
}

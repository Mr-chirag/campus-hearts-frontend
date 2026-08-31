import { Skeleton } from "@/components/ui/Skeleton";

export default function ProfileLoading() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 px-4 py-4 lg:py-8">
      <Skeleton className="h-56 w-full rounded-card" />
      <Skeleton className="h-32 w-full rounded-card" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-card" />
        ))}
      </div>
    </main>
  );
}

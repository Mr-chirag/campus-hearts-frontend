import { Skeleton } from "@/components/ui/Skeleton";

export default function CampusLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-4 lg:px-8 lg:py-8">
      <Skeleton className="mb-6 hidden h-9 w-32 lg:block" />
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <Skeleton className="h-64 w-full rounded-card" />
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-card" />
          ))}
        </div>
      </div>
    </main>
  );
}

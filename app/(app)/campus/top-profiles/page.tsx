"use client";

import { useEffect } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { TopProfileRow } from "@/components/campus/TopProfileRow";
import { useCampusStore } from "@/store/campusStore";

export default function TopProfilesPage() {
  const { topProfiles, isLoadingProfiles, fetchTopProfiles } = useCampusStore();

  useEffect(() => {
    void fetchTopProfiles();
  }, [fetchTopProfiles]);

  return (
    <>
      <AppHeader title="Top profiles" back="/campus" />

      <main className="mx-auto w-full max-w-2xl px-4 py-4 lg:py-8">
        <h1 className="mb-2 hidden font-display text-3xl font-bold text-ink lg:block">
          Top profiles
        </h1>
        <p className="mb-5 text-sm text-subtext">
          Ranked by profile strength — photos, a real bio and interests all count.
        </p>

        <Card className="p-2">
          {isLoadingProfiles && topProfiles.length === 0 ? (
            <ul className="space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <li key={i} className="flex items-center gap-3 px-3 py-3">
                  <Skeleton className="size-6 rounded" />
                  <Skeleton className="size-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </li>
              ))}
            </ul>
          ) : topProfiles.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-subtext">
              Nobody to rank yet.
            </p>
          ) : (
            <ul>
              {topProfiles.map((profile, index) => (
                <TopProfileRow key={profile._id} profile={profile} rank={index + 1} />
              ))}
            </ul>
          )}
        </Card>
      </main>
    </>
  );
}

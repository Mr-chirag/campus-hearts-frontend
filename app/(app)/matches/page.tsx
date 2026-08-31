import type { Metadata } from "next";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { MatchesView } from "@/components/matches/MatchesView";

export const metadata: Metadata = {
  title: "Matches",
  robots: { index: false, follow: false },
};

export default function MatchesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <MatchesView />
    </Suspense>
  );
}

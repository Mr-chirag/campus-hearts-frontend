import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import { PollCard } from "@/components/campus/PollCard";

export const metadata: Metadata = {
  title: "Poll",
  robots: { index: false, follow: false },
};

export default function PollsPage() {
  return (
    <>
      <AppHeader title="Poll of the day" back="/campus" />

      <main className="mx-auto w-full max-w-2xl px-4 py-4 lg:py-8">
        <PollCard />
      </main>
    </>
  );
}

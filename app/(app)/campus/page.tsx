import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Shuffle, Sparkles, Trophy } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { PollCard } from "@/components/campus/PollCard";

export const metadata: Metadata = {
  title: "Campus",
  robots: { index: false, follow: false },
};

const DESTINATIONS = [
  {
    href: "/campus/confessions",
    icon: Sparkles,
    title: "Confessions",
    body: "Say the thing you've been sitting on — anonymously, if you want.",
  },
  {
    href: "/campus/random-chat",
    icon: Shuffle,
    title: "Random chat",
    body: "Get paired with a stranger from campus. Reveal only if you both want to.",
  },
  {
    href: "/campus/top-profiles",
    icon: Trophy,
    title: "Top profiles",
    body: "The ten most complete profiles on campus right now.",
  },
];

export default function CampusPage() {
  return (
    <>
      <AppHeader title="Campus" mobileOnly />

      <main className="mx-auto w-full max-w-5xl px-4 py-4 lg:px-8 lg:py-8">
        <h1 className="mb-6 hidden font-display text-3xl font-bold text-ink lg:block">
          Campus
        </h1>

        {/* Stacked on a phone; two columns once there's room, so the poll and
            the destination list sit side by side instead of the poll pushing
            everything below the fold. */}
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <PollCard />

          <ul className="grid gap-4">
            {DESTINATIONS.map(({ href, icon: Icon, title, body }) => (
              <li key={href}>
                <Link href={href} className="block">
                  <Card className="flex items-center gap-4 transition-colors hover:border-primary">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                      <Icon className="size-6 text-primary-ink" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <CardTitle>{title}</CardTitle>
                      <CardDescription className="mt-1">{body}</CardDescription>
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-subtext" aria-hidden />
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}

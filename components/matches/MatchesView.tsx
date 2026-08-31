"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { MatchRow } from "./MatchRow";
import { ChatPane } from "@/components/chat/ChatPane";
import { Avatar } from "@/components/ui/Avatar";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useAuthStore } from "@/store/authStore";
import { useSwipeStore } from "@/store/swipeStore";
import type { Match } from "@/types";

/**
 * Mobile: a plain list; a row navigates to /chat/[matchId].
 * Desktop (lg+): a two-pane split — list on the left, the conversation on the
 * right — because a 1440px viewport showing one column of 56px avatars is a
 * stretched phone, not a desktop app.
 *
 * The selected match lives in the URL (?open=) so the pane survives a refresh
 * and the link is shareable. /chat/[matchId] stays a valid standalone route on
 * every viewport — it is what the match modal and notifications link to.
 */
export function MatchesView() {
  const searchParams = useSearchParams();
  const isDesktop = useIsDesktop();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { matches, fetchMatches, isLoadingMatches } = useSwipeStore();

  useEffect(() => {
    if (isAuthenticated) void fetchMatches();
  }, [isAuthenticated, fetchMatches]);

  const openId = searchParams.get("open");
  const selected = matches.find((m) => m._id === openId) ?? null;

  // A row points at the split-view on desktop and the full-screen route on
  // mobile. This is behaviour, not layout, so it cannot be done in CSS.
  const hrefFor = (matchId: string) =>
    isDesktop ? `/matches?open=${matchId}` : `/chat/${matchId}`;

  const loading = isLoadingMatches && matches.length === 0;

  return (
    <>
      <AppHeader title="Matches" mobileOnly />

      <div className="flex min-h-0 flex-1 lg:h-dvh-safe lg:overflow-hidden">
        {/* ------------------------------------------------------------ list */}
        <section
          className="min-w-0 flex-1 overflow-y-auto px-3 py-3 lg:w-[380px] lg:flex-none lg:px-4 lg:py-6"
          aria-label="Your matches"
        >
          <h1 className="mb-4 hidden font-display text-2xl font-bold text-ink lg:block">
            Matches
          </h1>

          {loading ? (
            <ul className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="flex items-center gap-3 px-3 py-3">
                  <Skeleton className="size-14 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </li>
              ))}
            </ul>
          ) : matches.length === 0 ? (
            <EmptyMatches />
          ) : (
            <ul className="space-y-1">
              {matches.map((match) => (
                <MatchRow
                  key={match._id}
                  match={match}
                  href={hrefFor(match._id)}
                  active={match._id === openId}
                />
              ))}
            </ul>
          )}
        </section>

        {/* ------------------------------------------------- detail (lg+) -- */}
        <section className="hidden min-w-0 flex-1 border-l border-border lg:flex lg:flex-col">
          {selected ? (
            <ChatPane
              // Keyed so switching conversations remounts with clean state
              // instead of briefly showing the previous person's messages.
              key={selected._id}
              matchId={selected._id}
              header={<SplitViewHeader match={selected} />}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
              <MessageCircle className="size-10 text-accent" aria-hidden />
              <p className="font-display text-lg font-bold text-ink">
                Pick a match
              </p>
              <p className="max-w-xs text-sm text-subtext">
                Choose someone on the left to open the conversation.
              </p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

/** The split-view's own header — no back button; the list is always visible. */
function SplitViewHeader({ match }: { match: Match }) {
  const anonymous = match.isAnonymous ?? false;
  const name = anonymous ? "Anonymous 💌" : (match.user?.full_name ?? "Match");
  const photo = anonymous ? undefined : match.user?.photos?.[0];

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
      <Avatar src={photo} name={name} anonymous={anonymous} size={40} />
      <h2 className="min-w-0 flex-1 truncate font-display text-lg font-bold text-ink">
        {name}
      </h2>
    </header>
  );
}

function EmptyMatches() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <span className="text-5xl" aria-hidden>
        💌
      </span>
      <h2 className="font-display text-lg font-bold text-ink">No matches yet</h2>
      <p className="max-w-xs text-sm leading-relaxed text-subtext">
        When you and someone else both like each other, they&apos;ll show up
        here.
      </p>
    </div>
  );
}

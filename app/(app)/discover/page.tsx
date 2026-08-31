"use client";

import { useCallback, useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { CompleteProfilePrompt } from "@/components/profile/CompleteProfilePrompt";
import { QuotaCounter } from "@/components/swipe/QuotaNotice";
import { PremiumUpsell } from "@/components/premium/PremiumUpsell";
import { Skeleton } from "@/components/ui/Skeleton";
import { SwipeDeck } from "@/components/swipe/SwipeDeck";
import dynamic from "next/dynamic";
import {
  ProfileDetailBody,
  ProfileDetailSheet,
} from "@/components/swipe/ProfileDetailSheet";
import { useAuthStore } from "@/store/authStore";

// Only ever rendered after a reciprocal like, so its weight has no business
// being in the initial Discover payload. ssr:false — it is purely interactive.
const MatchModal = dynamic(
  () => import("@/components/swipe/MatchModal").then((m) => m.MatchModal),
  { ssr: false }
);
import { useSwipeStore } from "@/store/swipeStore";
import type { SwipeAction, SwipeProfile } from "@/types";

interface MatchState {
  matchId?: string;
  name: string;
  photo?: string;
}

export default function DiscoverPage() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const {
    feed,
    feedVersion,
    fetchFeed,
    swipeUser,
    isLoadingFeed,
    quota,
    quotaBlock,
    clearQuotaBlock,
  } = useSwipeStore();

  const [match, setMatch] = useState<MatchState | null>(null);
  const [topProfile, setTopProfile] = useState<SwipeProfile | null>(null);
  const [detailProfile, setDetailProfile] = useState<SwipeProfile | null>(null);

  useEffect(() => {
    if (isAuthenticated) void fetchFeed();
  }, [isAuthenticated, fetchFeed]);

  const handleSwipe = useCallback(
    async (profile: SwipeProfile, action: SwipeAction) => {
      const { isMatch, matchId } = await swipeUser(profile._id, action);
      if (isMatch) {
        setMatch({ matchId, name: profile.full_name, photo: profile.photos?.[0] });
      }
    },
    [swipeUser]
  );

  /**
   * The deck ran out. The backend recycles `pass` swipes on the next call, so
   * refetching is what makes the deck loop — and returns an empty list only
   * when the pool is genuinely exhausted.
   */
  /**
   * Checked locally BEFORE the card animates away. The server is still the
   * authority — it refuses with a 429 regardless — but stopping here keeps the
   * profile in the deck instead of losing it to a swipe that was rejected.
   */
  const canSwipe = useCallback(
    (action: SwipeAction) => {
      if (!quota) return true; // not known yet — let the server decide
      if (action === "pass") return true;
      if (action === "superlike") return (quota.superlikes_remaining ?? 1) > 0;
      return quota.unlimited_likes || (quota.likes_remaining ?? 1) > 0;
    },
    [quota]
  );

  const handleBlocked = useCallback(
    (action: SwipeAction) => {
      useSwipeStore.setState({
        quotaBlock: {
          reason: action === "superlike" ? "superlike_quota" : "like_quota",
          message:
            action === "superlike"
              ? "You've used your superlike for today."
              : "You've used all your likes for today.",
        },
      });
    },
    []
  );

  const handleExhausted = useCallback(() => {
    void fetchFeed();
  }, [fetchFeed]);

  return (
    <>
      <AppHeader title="Discover" mobileOnly />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 lg:px-8 lg:py-8">
        <h1 className="mb-6 hidden font-display text-3xl font-bold text-ink lg:block">
          Discover
        </h1>

        <CompleteProfilePrompt />
        <QuotaCounter quota={quota} />

        {/* At xl the viewport is wide enough for the deck AND the top card's
            full profile side by side, so a desktop user isn't stuck peeking at
            a two-line bio through a phone-sized card. */}
        <div className="xl:grid xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] xl:gap-10">
          <div className="mx-auto w-full max-w-[420px] xl:mx-0">
            {isLoadingFeed && feed.length === 0 ? (
              <DeckSkeleton />
            ) : (
              <SwipeDeck
                key={feedVersion}
                profiles={feed}
                onSwipe={handleSwipe}
                onExhausted={handleExhausted}
                onTopChange={setTopProfile}
                onOpenDetail={setDetailProfile}
                canSwipe={canSwipe}
                onBlocked={handleBlocked}
              />
            )}
          </div>

          <aside className="hidden xl:block">
            {topProfile ? (
              <div className="rounded-card border border-border bg-surface p-6">
                <h2 className="font-display text-2xl font-bold text-ink">
                  {topProfile.full_name}
                </h2>
                <p className="mb-5 mt-1 text-sm text-subtext">
                  Semester {topProfile.semester} · {topProfile.branch}
                </p>
                <ProfileDetailBody profile={topProfile} />
              </div>
            ) : null}
          </aside>
        </div>
      </main>

      <ProfileDetailSheet
        profile={detailProfile}
        open={!!detailProfile}
        onOpenChange={(open) => !open && setDetailProfile(null)}
      />

      <PremiumUpsell
        open={!!quotaBlock}
        onOpenChange={(open) => !open && clearQuotaBlock()}
        trigger={quotaBlock?.reason === "superlike_quota" ? "superlikes" : "likes"}
        resetsAt={quota?.resets_at}
      />

      <MatchModal
        open={!!match}
        onClose={() => setMatch(null)}
        matchId={match?.matchId}
        matchName={match?.name ?? ""}
        matchPhoto={match?.photo}
        myPhoto={user?.photos?.[0]}
        myName={user?.full_name}
      />
    </>
  );
}

/** Reserves the card's exact box so nothing shifts when the feed lands. */
function DeckSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="mx-auto aspect-[3/4] w-full max-w-[420px] rounded-card" />
      <div className="mt-6 flex items-center justify-center gap-4">
        <Skeleton className="size-14 rounded-full" />
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="size-14 rounded-full" />
      </div>
    </div>
  );
}

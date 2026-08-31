"use client";

/**
 * The standalone, deep-linkable conversation. Mounts the same <ChatPane> the
 * desktop split-view at /matches uses, so the two cannot drift apart.
 *
 * This route stays valid on every viewport — the match modal, the mobile
 * matches list and any shared link all point here.
 */

import { use, useEffect } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Avatar } from "@/components/ui/Avatar";
import { ChatPane } from "@/components/chat/ChatPane";
import { useAuthStore } from "@/store/authStore";
import { useSwipeStore } from "@/store/swipeStore";

export default function ChatPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { matches, fetchMatches } = useSwipeStore();

  useEffect(() => {
    if (isAuthenticated && matches.length === 0) void fetchMatches();
  }, [isAuthenticated, matches.length, fetchMatches]);

  const match = matches.find((m) => m._id === matchId);
  const anonymous = match?.isAnonymous ?? false;
  const name = anonymous ? "Anonymous 💌" : (match?.user?.full_name ?? "Match");
  const photo = anonymous ? undefined : match?.user?.photos?.[0];

  return (
    // Fills the shell's exact-viewport box (see AppShell's height contract).
    // Asking for h-dvh here as well would stack a second full viewport inside
    // one that is already full height.
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatPane
        matchId={matchId}
        header={
          <AppHeader
            title={name}
            back="/matches"
            action={
              <Avatar src={photo} name={name} anonymous={anonymous} size={36} />
            }
          />
        }
      />
    </div>
  );
}

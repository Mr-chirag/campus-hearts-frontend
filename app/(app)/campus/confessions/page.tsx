"use client";

import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { PenLine } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  ReceivedConfessionCard,
  SentConfessionCard,
} from "@/components/campus/ConfessionCard";
import { ConfessionComposer } from "@/components/campus/ConfessionComposer";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { useCampusStore } from "@/store/campusStore";
import { useSwipeStore } from "@/store/swipeStore";
import { cn } from "@/lib/cn";

export default function ConfessionsPage() {
  const [composerOpen, setComposerOpen] = useState(false);

  const {
    confessions,
    sentConfessions,
    isLoadingConfessions,
    respondingToId,
    fetchReceivedConfessions,
    fetchSentConfessions,
    respondToConfession,
    revealConfessionSender,
  } = useCampusStore();

  const fetchMatches = useSwipeStore((s) => s.fetchMatches);

  useEffect(() => {
    void fetchReceivedConfessions();
    void fetchSentConfessions();
  }, [fetchReceivedConfessions, fetchSentConfessions]);

  /**
   * The receiver's accept emits to the SENDER's own user room. Without this the
   * sender sits on a "pending" card until they manually refresh, never learning
   * a chat just opened for them.
   */
  useSocketEvent<{ confessionId: string; matchId: string }>(
    "confession accepted",
    () => {
      void fetchSentConfessions();
      void fetchMatches();
      toast.success("Your confession was accepted 💖", {
        description: "You can chat now — you're still anonymous until you reveal.",
      });
    }
  );

  const handleRespond = async (confessionId: string, action: "accept" | "reject") => {
    const result = await respondToConfession(confessionId, action);
    // Accepting creates a Match, so the matches list is now stale.
    if (result?.status === "accepted") void fetchMatches();
  };

  const loading = isLoadingConfessions && confessions.length === 0 && sentConfessions.length === 0;

  return (
    <>
      <AppHeader
        title="Confessions"
        back="/campus"
        action={
          <Button size="sm" onClick={() => setComposerOpen(true)}>
            <PenLine className="size-4" aria-hidden />
            Write
          </Button>
        }
      />

      <main className="mx-auto w-full max-w-2xl px-4 py-4 lg:py-8">
        <Tabs.Root defaultValue="received">
          <Tabs.List
            className="mb-5 flex gap-1 rounded-full bg-surface-muted p-1"
            aria-label="Confessions"
          >
            <TabTrigger value="received" label="Received" count={confessions.length} />
            <TabTrigger value="sent" label="Sent" count={sentConfessions.length} />
          </Tabs.List>

          <Tabs.Content value="received" className="space-y-3 outline-none">
            {loading ? (
              <CardSkeletons />
            ) : confessions.length === 0 ? (
              <Empty
                emoji="💌"
                title="No confessions yet"
                body="When someone works up the nerve, it'll land here."
              />
            ) : (
              confessions.map((confession) => (
                <ReceivedConfessionCard
                  key={confession._id}
                  confession={confession}
                  busy={respondingToId === confession._id}
                  onRespond={(action) => void handleRespond(confession._id, action)}
                />
              ))
            )}
          </Tabs.Content>

          <Tabs.Content value="sent" className="space-y-3 outline-none">
            {loading ? (
              <CardSkeletons />
            ) : sentConfessions.length === 0 ? (
              <Empty
                emoji="✍️"
                title="You haven't sent any"
                body="Say the thing. Anonymously, if that helps."
                action={
                  <Button size="md" className="mt-5" onClick={() => setComposerOpen(true)}>
                    Write a confession
                  </Button>
                }
              />
            ) : (
              sentConfessions.map((confession) => (
                <SentConfessionCard
                  key={confession._id}
                  confession={confession}
                  busy={respondingToId === confession._id}
                  onReveal={() => void revealConfessionSender(confession._id)}
                />
              ))
            )}
          </Tabs.Content>
        </Tabs.Root>
      </main>

      <ConfessionComposer open={composerOpen} onOpenChange={setComposerOpen} />
    </>
  );
}

function TabTrigger({
  value,
  label,
  count,
}: {
  value: string;
  label: string;
  count: number;
}) {
  return (
    <Tabs.Trigger
      value={value}
      className={cn(
        "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
        "text-subtext data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-sm"
      )}
    >
      {label}
      {count > 0 && <span className="ml-1.5 tabular-nums opacity-60">{count}</span>}
    </Tabs.Trigger>
  );
}

function CardSkeletons() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-card" />
      ))}
    </>
  );
}

function Empty({
  emoji,
  title,
  body,
  action,
}: {
  emoji: string;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="text-5xl" aria-hidden>
        {emoji}
      </span>
      <h2 className="mt-4 font-display text-lg font-bold text-ink">{title}</h2>
      <p className="mt-1 max-w-xs text-sm leading-relaxed text-subtext">{body}</p>
      {action}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { BarChart3, Check } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCampusStore } from "@/store/campusStore";
import { cn } from "@/lib/cn";

/**
 * The daily poll.
 *
 * `hasVoted` comes from the SERVER and is the only thing that decides whether
 * the options are live. Never gate on local state alone: the backend reads the
 * poll with `.lean()` and compares voter ids by string — that comparison is
 * what actually enforces one-vote-per-person, and a 400 from it re-syncs us.
 */
export function PollCard() {
  const { poll, hasVoted, isLoadingPoll, isVoting, fetchPoll, votePoll } = useCampusStore();

  useEffect(() => {
    void fetchPoll();
  }, [fetchPoll]);

  if (isLoadingPoll && !poll) {
    return (
      <Card>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-3 h-6 w-3/4" />
        <div className="mt-5 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-2xl" />
          ))}
        </div>
      </Card>
    );
  }

  // The endpoint 404s when nothing is running. That is a normal state, not an
  // error — polls are created by whoever runs the campus, not by users.
  if (!poll) {
    return (
      <Card className="text-center">
        <BarChart3 className="mx-auto size-8 text-accent" aria-hidden />
        <CardTitle className="mt-3">No poll right now</CardTitle>
        <p className="mt-1 text-sm text-subtext">
          Check back later — a new one goes up regularly.
        </p>
      </Card>
    );
  }

  const total = poll.options.reduce((sum, option) => sum + option.votes, 0);

  return (
    <Card>
      <p className="text-xs font-bold uppercase tracking-wide text-primary-ink">
        Poll of the day
      </p>
      <CardTitle className="mt-2 text-xl">{poll.question}</CardTitle>

      <ul className="mt-5 space-y-2">
        {poll.options.map((option, index) => {
          const share = total > 0 ? Math.round((option.votes / total) * 100) : 0;

          return (
            <li key={`${option.text}-${index}`}>
              <button
                type="button"
                disabled={hasVoted || isVoting}
                onClick={() => void votePoll(poll._id, index)}
                className={cn(
                  "relative w-full overflow-hidden rounded-2xl border px-4 py-3 text-left transition-colors",
                  hasVoted
                    ? "cursor-default border-border bg-surface-muted"
                    : "border-border bg-surface hover:border-primary hover:bg-primary/5",
                  isVoting && "opacity-60"
                )}
              >
                {/* Results bar. Only drawn once voting has closed for you, so
                    the numbers can't anchor your choice before you make it. */}
                {hasVoted && (
                  <span
                    className="absolute inset-y-0 left-0 bg-primary/15 transition-[width] duration-500"
                    style={{ width: `${share}%` }}
                    aria-hidden
                  />
                )}

                <span className="relative flex items-center justify-between gap-3">
                  <span className="font-medium text-ink">{option.text}</span>
                  {hasVoted && (
                    <span className="shrink-0 text-sm font-bold tabular-nums text-primary-ink">
                      {share}%
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-subtext">
        {hasVoted && <Check className="size-3.5 text-success" aria-hidden />}
        {hasVoted ? "You voted · " : ""}
        {total} {total === 1 ? "vote" : "votes"}
      </p>
    </Card>
  );
}

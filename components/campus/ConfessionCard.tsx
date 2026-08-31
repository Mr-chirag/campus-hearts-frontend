"use client";

import Link from "next/link";
import { Check, Eye, MessageCircle, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatRelativeTime } from "@/lib/time";
import { cn } from "@/lib/cn";
import type { Confession } from "@/types";

/**
 * ANONYMITY, ENFORCED LOCALLY.
 *
 * The server already withholds the sender: a still-hidden confession arrives
 * with `sender = { full_name: 'Anonymous Sender', photos: [] }` and **no _id at
 * all**. This component nonetheless re-derives `masked` from the flags and
 * gates every identity-bearing element on it — name, photo and, above all, the
 * profile link. A link is the dangerous one: /profile/:id is a live lookup, so
 * one leaked id undoes the anonymity completely and permanently.
 *
 * Deriving it here means a future change upstream cannot quietly unmask anyone
 * through this card.
 */

const STATUS_STYLES: Record<Confession["status"], string> = {
  pending: "bg-gold/20 text-gold-ink",
  accepted: "bg-success/15 text-success",
  rejected: "bg-ink/10 text-subtext",
};

export function ReceivedConfessionCard({
  confession,
  busy,
  onRespond,
}: {
  confession: Confession;
  busy: boolean;
  onRespond: (action: "accept" | "reject") => void;
}) {
  const masked = confession.isAnonymous && !confession.senderRevealed;
  const name = masked ? "Anonymous 💌" : (confession.sender?.full_name ?? "Someone");
  const photo = masked ? undefined : confession.sender?.photos?.[0];
  // Only ever set when the sender is genuinely visible.
  const senderId = masked ? undefined : confession.sender?._id;

  return (
    <Card>
      <div className="flex items-center gap-3">
        <Avatar src={photo} name={name} anonymous={masked} size={44} />

        <div className="min-w-0 flex-1">
          {senderId ? (
            <Link
              href={`/profile/${senderId}`}
              className="truncate font-semibold text-ink hover:underline"
            >
              {name}
            </Link>
          ) : (
            <p className="truncate font-semibold text-ink">{name}</p>
          )}
          <p className="text-xs text-subtext">
            {formatRelativeTime(confession.createdAt)}
          </p>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
            STATUS_STYLES[confession.status]
          )}
        >
          {confession.status}
        </span>
      </div>

      <p className="mt-4 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink">
        {confession.content}
      </p>

      {confession.status === "pending" && (
        <div className="mt-5 flex gap-2">
          <Button
            size="md"
            variant="subtle"
            block
            loading={busy}
            onClick={() => onRespond("reject")}
          >
            <X className="size-4" aria-hidden />
            Pass
          </Button>
          <Button size="md" block loading={busy} onClick={() => onRespond("accept")}>
            <Check className="size-4" aria-hidden />
            Accept
          </Button>
        </div>
      )}

      {confession.status === "accepted" && confession.matchId && (
        <Button asChild size="md" variant="outline" block className="mt-5">
          <Link href={`/chat/${confession.matchId}`}>
            <MessageCircle className="size-4" aria-hidden />
            Open chat
          </Link>
        </Button>
      )}

      {confession.status === "accepted" && masked && (
        <p className="mt-3 text-xs italic text-subtext">
          They&apos;re still anonymous. They can reveal themselves whenever
          they&apos;re ready.
        </p>
      )}
    </Card>
  );
}

export function SentConfessionCard({
  confession,
  busy,
  onReveal,
}: {
  confession: Confession;
  busy: boolean;
  onReveal: () => void;
}) {
  // You always know who you wrote to — nothing is masked on this side.
  const name = confession.receiver?.full_name ?? "Someone";
  const canReveal =
    confession.status === "accepted" &&
    confession.isAnonymous &&
    !confession.senderRevealed;

  return (
    <Card>
      <div className="flex items-center gap-3">
        <Avatar src={confession.receiver?.photos?.[0]} name={name} size={44} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-subtext">
            To <span className="font-semibold text-ink">{name}</span>
          </p>
          <p className="text-xs text-subtext">
            {formatRelativeTime(confession.createdAt)}
            {confession.isAnonymous && " · sent anonymously"}
          </p>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
            STATUS_STYLES[confession.status]
          )}
        >
          {confession.status}
        </span>
      </div>

      <p className="mt-4 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink">
        {confession.content}
      </p>

      {confession.status === "pending" && (
        <p className="mt-4 text-xs italic text-subtext">
          Waiting for them to respond. You won&apos;t be told if they pass.
        </p>
      )}

      {confession.status === "accepted" && (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {confession.matchId && (
            <Button asChild size="md" variant="outline" block>
              <Link href={`/chat/${confession.matchId}`}>
                <MessageCircle className="size-4" aria-hidden />
                Open chat
              </Link>
            </Button>
          )}
          {canReveal && (
            <Button size="md" block loading={busy} onClick={onReveal}>
              <Eye className="size-4" aria-hidden />
              Reveal me
            </Button>
          )}
        </div>
      )}

      {confession.senderRevealed && confession.isAnonymous && (
        <p className="mt-3 text-xs text-subtext">You&apos;ve revealed yourself. 👋</p>
      )}
    </Card>
  );
}

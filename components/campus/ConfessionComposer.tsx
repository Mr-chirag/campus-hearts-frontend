"use client";

import { useEffect, useMemo, useState } from "react";
import { Lock, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { ResponsiveSheet } from "@/components/ui/ResponsiveSheet";
import { Skeleton } from "@/components/ui/Skeleton";
import { Switch } from "@/components/ui/Switch";
import { useAuthStore } from "@/store/authStore";
import { useCampusStore } from "@/store/campusStore";
import type { TopProfile } from "@/types";

/** The server rejects anything longer. Mirrored so the counter is honest. */
const MAX_LENGTH = 300;

/**
 * Recipients come from Top Profiles — it is the only endpoint that lists other
 * users, so the pool is capped at 10. A proper user-search endpoint would drop
 * straight in here without changing the rest of the flow. (Same constraint the
 * app has; the note is carried over so nobody assumes this is a design choice.)
 */
export function ConfessionComposer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const { topProfiles, isLoadingProfiles, fetchTopProfiles, sendConfession } =
    useCampusStore();

  const [query, setQuery] = useState("");
  const [recipient, setRecipient] = useState<TopProfile | null>(null);
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open && topProfiles.length === 0) void fetchTopProfiles();
  }, [open, topProfiles.length, fetchTopProfiles]);

  const candidates = useMemo(
    () =>
      topProfiles
        // You cannot confess to yourself; the server rejects it too.
        .filter((p) => p._id !== user?._id)
        .filter((p) => p.full_name.toLowerCase().includes(query.trim().toLowerCase())),
    [topProfiles, query, user?._id]
  );

  const reset = () => {
    setQuery("");
    setRecipient(null);
    setContent("");
    setIsAnonymous(true);
  };

  const close = () => {
    reset();
    onOpenChange(false);
  };

  const canSend = Boolean(recipient) && content.trim().length > 0 && !sending;

  const submit = async () => {
    if (!recipient || !canSend) return;
    setSending(true);
    try {
      await sendConfession(recipient._id, content.trim(), isAnonymous);
      toast.success("Confession sent 💌", {
        description: isAnonymous
          ? "They'll see the message, not your name."
          : `${recipient.full_name} will see it's from you.`,
      });
      close();
    } catch {
      // Surfaced by the store through <ErrorModal />.
    } finally {
      setSending(false);
    }
  };

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      title="Write a confession"
      description="Say the thing you've been sitting on."
    >
      {!recipient ? (
        <div>
          <Input
            label="Who's it for?"
            placeholder="Search by name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />

          <div className="mt-4 max-h-72 overflow-y-auto">
            {isLoadingProfiles && topProfiles.length === 0 ? (
              <ul className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-3 px-2 py-2">
                    <Skeleton className="size-11 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </li>
                ))}
              </ul>
            ) : candidates.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-subtext">
                {query
                  ? "Nobody by that name in the list."
                  : "No one to show yet."}
              </p>
            ) : (
              <ul className="space-y-1">
                {candidates.map((person) => (
                  <li key={person._id}>
                    <button
                      type="button"
                      onClick={() => setRecipient(person)}
                      className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition-colors hover:bg-surface-muted"
                    >
                      <Avatar
                        src={person.photos?.[0]}
                        name={person.full_name}
                        size={44}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-ink">
                          {person.full_name}
                        </span>
                        <span className="block truncate text-sm text-subtext">
                          Semester {person.semester} · {person.branch}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-4 text-xs italic text-subtext">
            Only the campus Top 10 can be picked for now — there&apos;s no
            people-search endpoint yet.
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 rounded-2xl bg-surface-muted p-3">
            <Avatar
              src={recipient.photos?.[0]}
              name={recipient.full_name}
              size={44}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs text-subtext">To</span>
              <span className="block truncate font-semibold text-ink">
                {recipient.full_name}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setRecipient(null)}
              aria-label="Choose someone else"
              className="flex size-9 items-center justify-center rounded-full text-subtext transition-colors hover:bg-surface hover:text-ink"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="mt-4">
            <Textarea
              label="Your confession"
              placeholder="I've been meaning to say…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_LENGTH}
              showCount
              autoFocus
            />
          </div>

          <label className="mt-2 flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-surface p-4">
            <Lock className="mt-0.5 size-5 shrink-0 text-primary-ink" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink">Send anonymously</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-subtext">
                {isAnonymous
                  ? "They'll see the message but not your name. If they accept, you can chat — and reveal yourself whenever you want."
                  : `${recipient.full_name} will see this is from you.`}
              </span>
            </span>
            <Switch
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
              aria-label="Send anonymously"
            />
          </label>

          <Button
            block
            className="mt-5"
            loading={sending}
            disabled={!canSend}
            onClick={() => void submit()}
          >
            Send confession
          </Button>
        </div>
      )}
    </ResponsiveSheet>
  );
}

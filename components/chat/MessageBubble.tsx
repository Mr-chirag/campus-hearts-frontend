import { Check, CheckCheck, Crown } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatClockTime } from "@/lib/time";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  mine: boolean;
  /** Only the last of MY messages carries a receipt, Instagram-style. */
  showReceipt?: boolean;
  /** First in a run from the same sender — gets the tail and more top margin. */
  startsGroup?: boolean;
  /** Receipts are Premium-only; free accounts get an explanation, not silence. */
  canSeeReceipts?: boolean;
  onUpsell?: () => void;
}

export function MessageBubble({
  message,
  mine,
  showReceipt,
  startsGroup,
  canSeeReceipts = true,
  onUpsell,
}: MessageBubbleProps) {
  const pending = message._id.startsWith("temp_");

  return (
    <li className={cn("flex px-4", mine ? "justify-end" : "justify-start", startsGroup ? "mt-3" : "mt-0.5")}>
      <div className={cn("max-w-[min(78%,32rem)]", mine ? "items-end" : "items-start")}>
        <div
          className={cn(
            "whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed shadow-sm",
            mine
              ? "bg-gradient-to-br from-primary to-secondary text-white"
              : "bg-surface text-ink",
            // Squared-off corner marks the start of a run from one sender.
            startsGroup && (mine ? "rounded-br-md" : "rounded-bl-md"),
            pending && "opacity-60"
          )}
        >
          {message.content}
        </div>

        <div
          className={cn(
            "mt-1 flex items-center gap-1 px-1 text-[11px] text-subtext",
            mine ? "justify-end" : "justify-start"
          )}
        >
          <time dateTime={message.createdAt}>{formatClockTime(message.createdAt)}</time>

          {mine && showReceipt && !pending && (
            canSeeReceipts ? (
              <span className="flex items-center gap-0.5">
                {message.seen ? (
                  <>
                    <CheckCheck className="size-3.5 text-primary-ink" aria-hidden />
                    <span className="font-medium text-primary-ink">Seen</span>
                  </>
                ) : (
                  <Check className="size-3.5" aria-hidden />
                )}
              </span>
            ) : (
              /* The server strips `seen` for free accounts, so showing a single
                 tick here would be a guess. Say why it's blank instead. */
              <button
                type="button"
                onClick={onUpsell}
                className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium text-subtext transition-colors hover:bg-gold/15 hover:text-gold-ink"
              >
                <Crown className="size-3" aria-hidden />
                Read receipts
              </button>
            )
          )}
        </div>
      </div>
    </li>
  );
}

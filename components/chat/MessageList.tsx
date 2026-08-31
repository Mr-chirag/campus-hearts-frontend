"use client";

import { Fragment, useEffect, useLayoutEffect, useRef } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { MessageBubble } from "./MessageBubble";
import { TypingDots } from "./TypingDots";
import { formatDayLabel } from "@/lib/time";
import { senderIdOf, type Message } from "@/types";

interface MessageListProps {
  messages: Message[];
  myId?: string;
  partnerName: string;
  partnerTyping: boolean;
  hasMore: boolean;
  isLoadingEarlier: boolean;
  onLoadEarlier: () => void;
  emptyState?: React.ReactNode;
  canSeeReceipts?: boolean;
  onUpsell?: () => void;
}

/** Same calendar day? Used for the date separators. */
const sameDay = (a: string, b: string) => {
  const x = new Date(a);
  const y = new Date(b);
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  );
};

export function MessageList({
  messages,
  myId,
  partnerName,
  partnerTyping,
  hasMore,
  isLoadingEarlier,
  onLoadEarlier,
  emptyState,
  canSeeReceipts = true,
  onUpsell,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const previousCount = useRef(0);
  const previousHeight = useRef(0);

  /**
   * Two different scroll behaviours share this list:
   *   • a NEW message arrives  → stick to the bottom
   *   • OLDER history loads    → keep the reader where they were, which means
   *     restoring scrollTop by the height the prepended page added.
   * Both must run before paint, hence useLayoutEffect.
   */
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const grewAtTop = messages.length > previousCount.current && previousCount.current > 0;
    const addedHeight = el.scrollHeight - previousHeight.current;

    // Prepended history: the first message id changed.
    const prepended = grewAtTop && el.scrollTop < 80 && addedHeight > 0;

    if (prepended) {
      el.scrollTop = addedHeight;
    } else {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }

    previousCount.current = messages.length;
    previousHeight.current = el.scrollHeight;
  }, [messages]);

  // Typing indicator appearing shouldn't yank the view if the user scrolled up.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !partnerTyping) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) bottomRef.current?.scrollIntoView({ block: "end" });
  }, [partnerTyping]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || !hasMore || isLoadingEarlier) return;
    if (el.scrollTop < 60) onLoadEarlier();
  };

  if (messages.length === 0 && emptyState) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="flex min-h-full flex-col justify-center">{emptyState}</div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-y-auto">
      {/*
        Bottom-anchored, the way every chat app behaves: a short conversation
        sits on top of the composer and grows upward, rather than clinging to
        the header with a void beneath it. `min-h-full` + `justify-end` does
        this without breaking scrolling once the content overflows — unlike
        flex-col-reverse, which also inverts the scrollbar and wheel direction.
      */}
      <div className="flex min-h-full flex-col justify-end py-3">
      {isLoadingEarlier && (
        <div className="flex justify-center py-3">
          <Spinner />
        </div>
      )}

      {!hasMore && messages.length > 0 && (
        <p className="px-4 py-3 text-center text-xs text-subtext">
          This is the beginning of your conversation.
        </p>
      )}

      {/* Screen readers get told when a message arrives; "polite" waits for a
          pause rather than interrupting whatever is being read. */}
      <ul aria-live="polite" aria-relevant="additions">
        {messages.map((message, i) => {
          const sender = senderIdOf(message);
          // 'me' is the optimistic placeholder id set by chatStore.sendMessage.
          const mine = sender === myId || sender === "me";

          const previous = messages[i - 1];
          const startsGroup = !previous || senderIdOf(previous) !== sender;
          const newDay = !previous || !sameDay(previous.createdAt, message.createdAt);

          // Receipt goes under the LAST message I sent, and nowhere else.
          const isMyLast =
            mine && !messages.slice(i + 1).some((m) => {
              const s = senderIdOf(m);
              return s === myId || s === "me";
            });

          return (
            // Fragment, not a wrapper <li> — an <li> may not contain another.
            <Fragment key={message._id}>
              {newDay && (
                <li className="my-4 flex justify-center">
                  <span className="rounded-full bg-surface px-3 py-1 text-[11px] font-semibold text-subtext shadow-sm">
                    {formatDayLabel(message.createdAt)}
                  </span>
                </li>
              )}
              <MessageBubble
                message={message}
                mine={mine}
                showReceipt={isMyLast}
                startsGroup={startsGroup || newDay}
                canSeeReceipts={canSeeReceipts}
                onUpsell={onUpsell}
              />
            </Fragment>
          );
        })}
      </ul>

      {partnerTyping && <TypingDots name={partnerName} />}

      <div ref={bottomRef} />
      </div>
    </div>
  );
}

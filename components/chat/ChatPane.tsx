"use client";

import { Eye, Lock, WifiOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Composer } from "./Composer";
import { PremiumUpsell } from "@/components/premium/PremiumUpsell";
import { MessageList } from "./MessageList";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useSocketConnected, useSocketEvent } from "@/hooks/useSocketEvent";
import { ICEBREAKERS } from "@/lib/icebreakers";
import { socket } from "@/services/socket";
import { useAuthStore } from "@/store/authStore";
import { useCampusStore } from "@/store/campusStore";
import { useChatStore } from "@/store/chatStore";
import { useSwipeStore } from "@/store/swipeStore";
import type { Message } from "@/types";

/** How long after the last keystroke we tell the other side we stopped. */
const TYPING_IDLE_MS = 1800;

interface ChatPaneProps {
  matchId: string;
  /** Rendered above the messages on mobile; the split-view supplies its own. */
  header?: React.ReactNode;
}

/**
 * The conversation. Mounted by BOTH /chat/[matchId] (full screen) and the
 * desktop split-view at /matches — same component, same behaviour, so the two
 * can never drift apart.
 *
 * THE SEND PATH IS POST-THEN-EMIT AND MUST STAY THAT WAY.
 * `POST /api/chat/:matchId` persists the message and returns it, but the server
 * does NOT broadcast on creation — it only rebroadcasts what a client relays.
 * So the client emits `new message` itself afterwards. Drop that emit and
 * messages still save but never arrive in realtime.
 */
export function ChatPane({ matchId, header }: ChatPaneProps) {
  const user = useAuthStore((s) => s.user);
  const connected = useSocketConnected();

  const { matches, fetchMatches } = useSwipeStore();
  const { revealConfessionSender, respondingToId } = useCampusStore();
  const {
    messages,
    hasMore,
    isLoadingMessages,
    isLoadingEarlier,
    fetchMessages,
    loadEarlierMessages,
    sendMessage,
    receiveMessage,
    markSeen,
    handleSeenEvent,
  } = useChatStore();

  const [partnerTyping, setPartnerTyping] = useState(false);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const typingResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const match = matches.find((m) => m._id === matchId);

  /**
   * ANONYMITY. Derived from the match flags, never from a cached name, a route
   * param, or whatever the last screen happened to pass along — those carry the
   * REAL name and photo, which is exactly how a mask gets undone by accident.
   * You are never anonymous to yourself.
   */
  const isAnonymous = match?.isAnonymous ?? false;
  const iAmAnonymous = match?.iAmAnonymous ?? false;
  const partnerName = isAnonymous ? "Anonymous 💌" : (match?.user?.full_name ?? "Match");
  const partnerPhoto = isAnonymous ? undefined : match?.user?.photos?.[0];

  const chatMessages = useMemo(() => messages[matchId] ?? [], [messages, matchId]);

  /* ------------------------------------------------------------- bootstrap */

  useEffect(() => {
    if (matches.length === 0) void fetchMatches();
  }, [matches.length, fetchMatches]);

  useEffect(() => {
    if (!matchId) return;
    void fetchMessages(matchId);
    // Opening a chat is what marks their messages seen. Premium users and
    // anyone with read receipts off short-circuit server-side (ghost read),
    // so nothing here needs to know about it.
    void markSeen(matchId);
  }, [matchId, fetchMessages, markSeen]);

  /* ----------------------------------------------------------- room join -- */

  const joinRoom = useCallback(() => {
    if (matchId) socket.emit("join chat", matchId);
  }, [matchId]);

  useEffect(() => {
    joinRoom();
  }, [joinRoom]);

  // Rejoin after a reconnect — room membership does not survive a dropped
  // socket, and without this the chat goes quietly one-way.
  useSocketEvent("connect", () => {
    joinRoom();
    void fetchMessages(matchId, true);
  });

  /* -------------------------------------------------------------- events -- */

  useSocketEvent<Message>("message received", (payload) => {
    if (!payload || payload.matchId !== matchId) return;
    receiveMessage(matchId, payload);
    // They're looking at it right now, so mark it seen immediately.
    void markSeen(matchId);
  });

  useSocketEvent("typing", () => {
    setPartnerTyping(true);
    if (typingResetRef.current) clearTimeout(typingResetRef.current);
    // Safety net: the other client can disconnect without ever sending
    // 'stop typing', which would leave the dots up forever.
    typingResetRef.current = setTimeout(() => setPartnerTyping(false), TYPING_IDLE_MS + 1500);
  });

  useSocketEvent("stop typing", () => setPartnerTyping(false));

  /**
   * The anonymous party dropped their mask. The server has already cleared
   * `anonymousUserId` on the match, so refetching is what swaps the placeholder
   * for their real name and photo — without it this chat would keep saying
   * "Anonymous 💌" to someone who has just introduced themselves.
   */
  useSocketEvent<{ matchId: string }>("identity revealed", (payload) => {
    if (!payload || payload.matchId !== matchId) return;
    void fetchMatches();
    void fetchMessages(matchId, true);
  });

  useSocketEvent<{ matchId: string; seenBy: string }>("messages seen", (payload) => {
    if (!payload || payload.matchId !== matchId) return;
    // The server emits to the WHOLE room including whoever did the marking.
    // Acting on our own event would tick our own messages as "Seen" when in
    // fact we just read theirs.
    if (payload.seenBy === user?._id) return;
    handleSeenEvent(matchId);
  });

  useEffect(
    () => () => {
      if (typingResetRef.current) clearTimeout(typingResetRef.current);
    },
    []
  );

  /* ---------------------------------------------------------------- send -- */

  const emitStopTyping = useCallback(() => {
    socket.emit("stop typing", matchId);
  }, [matchId]);

  const debouncedStopTyping = useDebouncedCallback(emitStopTyping, TYPING_IDLE_MS);

  const handleTyping = useCallback(() => {
    socket.emit("typing", matchId);
    debouncedStopTyping();
  }, [matchId, debouncedStopTyping]);

  const handleSend = useCallback(
    async (content: string) => {
      const sent = await sendMessage(matchId, content);
      // POST first, THEN relay. The server never broadcasts on creation.
      if (sent) socket.emit("new message", sent);
    },
    [matchId, sendMessage]
  );

  /* -------------------------------------------------------------- render -- */

  if (isLoadingMessages && chatMessages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {header}
        <div className="flex-1 space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className={`h-11 ${i % 2 ? "ml-auto w-1/2" : "w-2/3"} rounded-2xl`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {header}

      {!connected && (
        <p className="flex items-center justify-center gap-2 bg-gold/20 px-4 py-2 text-xs font-semibold text-gold-ink">
          <WifiOff className="size-3.5" aria-hidden />
          Reconnecting — messages may be delayed
        </p>
      )}

      {isAnonymous && (
        <div className="flex items-start gap-2 border-b border-border bg-accent/20 px-4 py-3 text-xs leading-relaxed text-primary-ink">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p className="flex-1">
            {iAmAnonymous
              ? "They don't know who you are. Reveal yourself whenever you're ready."
              : "This match came from an anonymous confession. They'll reveal themselves when they're ready."}
          </p>
          {iAmAnonymous && match?.confessionId && (
            <Button
              size="sm"
              variant="outline"
              loading={respondingToId === match.confessionId}
              onClick={() => void revealConfessionSender(match.confessionId!)}
            >
              <Eye className="size-4" aria-hidden />
              Reveal
            </Button>
          )}
        </div>
      )}

      <MessageList
        messages={chatMessages}
        myId={user?._id}
        partnerName={partnerName}
        partnerTyping={partnerTyping}
        hasMore={hasMore[matchId] ?? false}
        isLoadingEarlier={isLoadingEarlier}
        onLoadEarlier={() => void loadEarlierMessages(matchId)}
        canSeeReceipts={user?.is_premium ?? false}
        onUpsell={() => setUpsellOpen(true)}
        emptyState={
          <EmptyChat
            name={partnerName}
            photo={partnerPhoto}
            anonymous={isAnonymous}
            onPick={(text) => void handleSend(text)}
          />
        }
      />

      <Composer
        onSend={(content) => void handleSend(content)}
        onTyping={handleTyping}
        onStopTyping={emitStopTyping}
        placeholder={`Message ${partnerName}…`}
      />

      <PremiumUpsell
        open={upsellOpen}
        onOpenChange={setUpsellOpen}
        trigger="receipts"
      />
    </div>
  );
}

function EmptyChat({
  name,
  photo,
  anonymous,
  onPick,
}: {
  name: string;
  photo?: string;
  anonymous: boolean;
  onPick: (text: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <Avatar src={photo} name={name} anonymous={anonymous} size={80} />
      <div>
        <h2 className="font-display text-lg font-bold text-ink">
          You matched with {name}
        </h2>
        <p className="mt-1 text-sm text-subtext">Say something. Anything.</p>
      </div>

      <ul className="mt-2 flex w-full max-w-sm flex-col gap-2">
        {ICEBREAKERS.map((text) => (
          <li key={text}>
            <button
              type="button"
              onClick={() => onPick(text)}
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-left text-sm text-ink transition-colors hover:border-primary hover:bg-primary/5"
            >
              {text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

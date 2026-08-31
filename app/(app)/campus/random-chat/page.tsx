"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Eye, LogOut, Shuffle, UserX } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Composer } from "@/components/chat/Composer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { useRandomChatStore } from "@/store/randomChatStore";
import { formatClockTime } from "@/lib/time";
import { cn } from "@/lib/cn";
import { useState } from "react";

export default function RandomChatPage() {
  const {
    status,
    messages,
    isLoading,
    isRevealing,
    revealResult,
    joinQueue,
    sendMessage,
    reveal,
    leaveSession,
    abandonSession,
    reset,
    partnerJoined,
    partnerLeft,
    receiveStrangerMessage,
  } = useRandomChatStore();

  const [confirmLeave, setConfirmLeave] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------- sockets -- */

  useSocketEvent("partner_joined", partnerJoined);
  useSocketEvent("partner left", partnerLeft);
  useSocketEvent<{ content: string }>("random text received", (payload) => {
    if (payload?.content) receiveStrangerMessage(payload.content);
  });

  /* --------------------------------------------------------------- exits -- */

  /**
   * A WEB-ONLY PROBLEM THE APP NEVER HAD.
   *
   * On a phone you leave a screen; in a browser you close the tab, and nothing
   * tells the server. Without this, whoever you were paired with sits staring
   * at a dead conversation until the 300s TTL reaps the room.
   *
   * `pagehide` fires reliably on mobile Safari where `beforeunload` does not,
   * so both are wired. The emit goes over the already-open websocket, which the
   * browser flushes as it tears down.
   */
  useEffect(() => {
    const bail = () => abandonSession();
    window.addEventListener("pagehide", bail);
    window.addEventListener("beforeunload", bail);
    return () => {
      window.removeEventListener("pagehide", bail);
      window.removeEventListener("beforeunload", bail);
    };
  }, [abandonSession]);

  // Navigating away inside the app (tab bar, back) must also release the queue.
  useEffect(
    () => () => {
      abandonSession();
      reset();
    },
    [abandonSession, reset]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  /* -------------------------------------------------------------- render -- */

  const inConversation = status === "chatting";

  return (
    <>
      <AppHeader
        title="Random chat"
        back="/campus"
        action={
          inConversation ? (
            <Button size="sm" variant="subtle" onClick={() => setConfirmLeave(true)}>
              <LogOut className="size-4" aria-hidden />
              Leave
            </Button>
          ) : undefined
        }
      />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-4 lg:py-8">
        {status === "idle" && (
          <Centered>
            <span className="flex size-20 items-center justify-center rounded-full bg-primary/10">
              <Shuffle className="size-9 text-primary-ink" aria-hidden />
            </span>
            <h1 className="mt-6 font-display text-2xl font-bold text-ink">
              Talk to a stranger
            </h1>
            <p className="mt-2 max-w-sm text-pretty leading-relaxed text-subtext">
              You&apos;ll be paired with someone else on campus. Neither of you sees
              a name or a photo. If you both choose to reveal, it becomes a real
              match.
            </p>
            <Button className="mt-8 w-full max-w-xs" loading={isLoading} onClick={() => void joinQueue()}>
              Find someone
            </Button>
          </Centered>
        )}

        {(status === "searching" || status === "waiting") && (
          <Centered>
            <span className="relative flex size-20 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/25" />
              <span className="relative flex size-20 items-center justify-center rounded-full bg-primary/10">
                <Shuffle className="size-9 text-primary-ink" aria-hidden />
              </span>
            </span>
            <h1 className="mt-6 font-display text-2xl font-bold text-ink">
              Looking for someone…
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-subtext">
              Hang on while we find another student who&apos;s up for a chat.
            </p>
            <Button
              variant="subtle"
              className="mt-8 w-full max-w-xs"
              onClick={() => void leaveSession()}
            >
              Cancel
            </Button>
          </Centered>
        )}

        {inConversation && (
          <div className="flex min-h-0 flex-1 flex-col">
            <p className="mb-3 rounded-2xl bg-accent/25 px-4 py-2.5 text-center text-xs leading-relaxed text-primary-ink">
              You&apos;re both anonymous. Nothing here is saved.
            </p>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="flex min-h-full flex-col justify-end gap-1 pb-2">
                {messages.length === 0 && (
                  <p className="py-10 text-center text-sm text-subtext">
                    Say hi. They can&apos;t see who you are.
                  </p>
                )}

                {messages.map((message) => {
                  const mine = message.from === "me";
                  return (
                    <div
                      key={message.id}
                      className={cn("flex px-1", mine ? "justify-end" : "justify-start")}
                    >
                      <div className="max-w-[78%]">
                        <div
                          className={cn(
                            "whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed shadow-sm",
                            mine
                              ? "bg-gradient-to-br from-primary to-secondary text-white"
                              : "bg-surface text-ink"
                          )}
                        >
                          {message.content}
                        </div>
                        <p
                          className={cn(
                            "mt-1 px-1 text-[11px] text-subtext",
                            mine ? "text-right" : "text-left"
                          )}
                        >
                          {formatClockTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            </div>

            <Button
              variant="outline"
              className="my-3"
              loading={isRevealing}
              onClick={() => void reveal()}
            >
              <Eye className="size-4" aria-hidden />
              Reveal who I am
            </Button>

            <Composer
              onSend={sendMessage}
              onTyping={() => {}}
              onStopTyping={() => {}}
              placeholder="Say something…"
            />
          </div>
        )}

        {status === "reveal" && (
          <Centered>
            {revealResult?.isMatch ? (
              <>
                <span className="text-6xl" aria-hidden>
                  💖
                </span>
                <h1 className="mt-5 font-display text-2xl font-bold text-ink">
                  You both revealed!
                </h1>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-subtext">
                  This is a real match now — the conversation moves to your
                  Matches, where it&apos;s saved.
                </p>
                {revealResult.match?._id && (
                  <Button asChild className="mt-8 w-full max-w-xs">
                    <Link href={`/chat/${revealResult.match._id}`}>Open the chat</Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="mt-2 w-full max-w-xs"
                  onClick={() => reset()}
                >
                  Chat with someone else
                </Button>
              </>
            ) : (
              <>
                <span className="text-6xl" aria-hidden>
                  🫣
                </span>
                <h1 className="mt-5 font-display text-2xl font-bold text-ink">
                  You&apos;ve revealed yourself
                </h1>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-subtext">
                  They&apos;ll see who you are. If they reveal too, it becomes a
                  real match.
                </p>
                <Button
                  variant="subtle"
                  className="mt-8 w-full max-w-xs"
                  onClick={() => void leaveSession()}
                >
                  End chat
                </Button>
              </>
            )}
          </Centered>
        )}

        {status === "left" && (
          <Centered>
            <span className="flex size-20 items-center justify-center rounded-full bg-ink/5">
              <UserX className="size-9 text-subtext" aria-hidden />
            </span>
            <h1 className="mt-6 font-display text-2xl font-bold text-ink">
              They left
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-subtext">
              The other person ended the chat.
            </p>
            <Button className="mt-8 w-full max-w-xs" onClick={() => void joinQueue()}>
              Find someone else
            </Button>
          </Centered>
        )}
      </main>

      <ConfirmDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title="Leave this chat?"
        description="The conversation isn't saved, and you won't be able to get back to it."
        confirmLabel="Leave"
        destructive
        onConfirm={() => {
          setConfirmLeave(false);
          void leaveSession();
        }}
      />
    </>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <Card className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center">
      {children}
    </Card>
  );
}

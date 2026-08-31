"use client";

import { Heart, RotateCcw, Star, X } from "lucide-react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SwipeCard } from "./SwipeCard";
import { cn } from "@/lib/cn";
import type { SwipeAction, SwipeProfile } from "@/types";

/** Past this many px, releasing commits the swipe. */
const COMMIT_DISTANCE = 110;
/** …or a flick faster than this, however short. */
const COMMIT_VELOCITY = 550;
/** Cards rendered behind the top one. Three total reads as a deck. */
const STACK_DEPTH = 3;

interface SwipeDeckProps {
  profiles: SwipeProfile[];
  onSwipe: (profile: SwipeProfile, action: SwipeAction) => void | Promise<void>;
  onExhausted?: () => void;
  onOpenDetail?: (profile: SwipeProfile) => void;
  /** Fires as the deck advances, so a desktop rail can mirror the top card. */
  onTopChange?: (profile: SwipeProfile | null) => void;
  /**
   * Whether this action is currently allowed (daily quota). Returning false
   * makes the card spring BACK rather than fly away — a card that leaves the
   * deck on a swipe the server refused would lose that person until the next
   * refetch, which is worse than the limit itself.
   */
  canSwipe?: (action: SwipeAction) => boolean;
  onBlocked?: (action: SwipeAction) => void;
}

/**
 * Replaces `react-native-deck-swiper` with Framer Motion drag.
 *
 * THREE EQUAL INPUT PATHS, not one plus fallbacks:
 *   • drag       — touch and mouse, with velocity-aware release
 *   • buttons    — the primary path on desktop, and the accessible one
 *   • keyboard   — ← pass, → like, ↑ superlike, Space open profile
 *
 * The keyboard path is the affordance a phone could never offer, and it makes
 * the deck usable by someone who cannot drag at all.
 *
 * The parent's `profiles` array is never mutated or filtered as cards go by —
 * an internal index advances instead. Splicing the source array makes indices
 * drift and submits the wrong user on the next swipe (the same trap documented
 * in swipeStore.swipeUser).
 */
export function SwipeDeck({
  profiles,
  onSwipe,
  onExhausted,
  onOpenDetail,
  onTopChange,
  canSwipe,
  onBlocked,
}: SwipeDeckProps) {
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotate = useTransform(x, [-260, 0, 260], [-16, 0, 16]);
  const likeOpacity = useTransform(x, [30, 140], [0, 1]);
  const nopeOpacity = useTransform(x, [-140, -30], [1, 0]);
  const superOpacity = useTransform(y, [-140, -40], [1, 0]);

  const top = profiles[index];
  const exhaustedRef = useRef(false);

  // NOTE: the deck does not reset itself when `profiles` changes. Resetting
  // state from a prop in an effect causes a wasted render pass; the parent
  // remounts this component with a fresh `key` when it loads a new feed, which
  // is React's own answer to "reset state when a prop changes".

  useEffect(() => {
    onTopChange?.(top ?? null);
  }, [top, onTopChange]);

  useEffect(() => {
    if (!top && profiles.length > 0 && !exhaustedRef.current) {
      exhaustedRef.current = true;
      onExhausted?.();
    }
  }, [top, profiles.length, onExhausted]);

  /** Animates the top card off-screen, then commits and advances. */
  const fly = useCallback(
    async (action: SwipeAction) => {
      const profile = profiles[index];
      if (!profile || busy) return;

      // Out of allowance: snap back, keep the card, explain why.
      if (canSwipe && !canSwipe(action)) {
        animate(x, 0, { type: "spring", stiffness: 400, damping: 32 });
        animate(y, 0, { type: "spring", stiffness: 400, damping: 32 });
        onBlocked?.(action);
        return;
      }

      setBusy(true);

      const target =
        action === "superlike"
          ? { x: 0, y: -900 }
          : { x: action === "like" ? 700 : -700, y: 0 };

      await Promise.all([
        animate(x, target.x, { duration: 0.32, ease: "easeOut" }),
        animate(y, target.y, { duration: 0.32, ease: "easeOut" }),
      ]);

      // Reset BEFORE advancing so the next card doesn't flash in off-screen.
      x.set(0);
      y.set(0);
      setIndex((i) => i + 1);

      try {
        await onSwipe(profile, action);
      } finally {
        setBusy(false);
      }
    },
    [profiles, index, busy, onSwipe, x, y, canSwipe, onBlocked]
  );

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;

    // Upward flick with little sideways movement reads as a superlike.
    if (offset.y < -COMMIT_DISTANCE && Math.abs(offset.x) < COMMIT_DISTANCE) {
      void fly("superlike");
      return;
    }

    const committed =
      Math.abs(offset.x) > COMMIT_DISTANCE || Math.abs(velocity.x) > COMMIT_VELOCITY;

    if (committed) {
      void fly(offset.x > 0 ? "like" : "pass");
      return;
    }

    // Spring back. Snappy, not bouncy — this happens constantly.
    animate(x, 0, { type: "spring", stiffness: 400, damping: 32 });
    animate(y, 0, { type: "spring", stiffness: 400, damping: 32 });
  };

  /* ------------------------------------------------------------- keyboard - */

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Never hijack keys while someone is typing.
      const el = document.activeElement;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement ||
        (el as HTMLElement | null)?.isContentEditable
      ) {
        return;
      }
      if (!top || busy) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          void fly("pass");
          break;
        case "ArrowRight":
          event.preventDefault();
          void fly("like");
          break;
        case "ArrowUp":
          event.preventDefault();
          void fly("superlike");
          break;
        case " ":
          event.preventDefault();
          onOpenDetail?.(top);
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fly, top, busy, onOpenDetail]);

  /* -------------------------------------------------------------- render -- */

  if (!top) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-4 rounded-card border border-border bg-surface px-8 py-16 text-center">
        <span className="text-5xl" aria-hidden>
          🫧
        </span>
        <h2 className="font-display text-xl font-bold text-ink">
          You&apos;re all caught up
        </h2>
        <p className="max-w-xs text-sm leading-relaxed text-subtext">
          You&apos;ve seen everyone on campus for now. Check back later — new
          students join all the time.
        </p>
        <button
          type="button"
          onClick={() => onExhausted?.()}
          className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary-ink hover:underline"
        >
          <RotateCcw className="size-4" aria-hidden />
          Refresh the deck
        </button>
      </div>
    );
  }

  const stack = profiles.slice(index, index + STACK_DEPTH);

  return (
    <div className="w-full">
      <div className="group relative mx-auto aspect-[3/4] w-full max-w-[420px]">
        {/* Rendered back-to-front so the top card is last in the DOM. */}
        {stack
          .map((profile, depth) => ({ profile, depth }))
          .reverse()
          .map(({ profile, depth }) =>
            depth === 0 ? (
              <motion.div
                key={profile._id}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                style={{ x, y, rotate }}
                drag
                dragElastic={0.55}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                onDragEnd={handleDragEnd}
                whileTap={{ scale: 0.985 }}
              >
                <SwipeCard
                  profile={profile}
                  interactive
                  priority
                  onOpenDetail={onOpenDetail ? () => onOpenDetail(profile) : undefined}
                />

                {/* Decision overlays, driven straight off the drag position. */}
                <motion.span
                  style={{ opacity: likeOpacity }}
                  className="pointer-events-none absolute left-5 top-6 -rotate-12 rounded-xl border-4 border-success px-4 py-1.5 font-display text-2xl font-extrabold uppercase tracking-wider text-success"
                  aria-hidden
                >
                  Like
                </motion.span>
                <motion.span
                  style={{ opacity: nopeOpacity }}
                  className="pointer-events-none absolute right-5 top-6 rotate-12 rounded-xl border-4 border-danger px-4 py-1.5 font-display text-2xl font-extrabold uppercase tracking-wider text-danger"
                  aria-hidden
                >
                  Nope
                </motion.span>
                <motion.span
                  style={{ opacity: superOpacity }}
                  className="pointer-events-none absolute inset-x-0 bottom-24 mx-auto w-fit rounded-xl border-4 border-gold px-4 py-1.5 font-display text-2xl font-extrabold uppercase tracking-wider text-gold"
                  aria-hidden
                >
                  Super
                </motion.span>
              </motion.div>
            ) : (
              <div
                key={profile._id}
                className="absolute inset-0 origin-bottom"
                style={{
                  transform: `scale(${1 - depth * 0.04}) translateY(${depth * -10}px)`,
                  zIndex: -depth,
                }}
                aria-hidden
              >
                <SwipeCard profile={profile} />
              </div>
            )
          )}
      </div>

      {/* ------------------------------------------------------- action bar */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <ActionButton
          label={`Pass on ${top.full_name}`}
          onClick={() => void fly("pass")}
          disabled={busy}
          className="size-14 border-danger/25 text-danger hover:bg-danger/10"
        >
          <X className="size-7" strokeWidth={2.5} />
        </ActionButton>

        <ActionButton
          label={`Superlike ${top.full_name}`}
          onClick={() => void fly("superlike")}
          disabled={busy}
          className="size-12 border-gold/40 text-gold-ink hover:bg-gold/15"
        >
          <Star className="size-6" strokeWidth={2.5} />
        </ActionButton>

        <ActionButton
          label={`Like ${top.full_name}`}
          onClick={() => void fly("like")}
          disabled={busy}
          className="size-14 border-primary/30 text-primary hover:bg-primary/10"
        >
          <Heart className="size-7" strokeWidth={2.5} />
        </ActionButton>
      </div>

      {/* Desktop-only hint. The keyboard path is invisible otherwise. */}
      <p className="mt-5 hidden text-center text-xs text-subtext lg:block">
        <Key>←</Key> pass · <Key>→</Key> like · <Key>↑</Key> superlike ·{" "}
        <Key>Space</Key> full profile
      </p>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex items-center justify-center rounded-full border-2 bg-surface shadow-md transition-all active:scale-90 disabled:opacity-40",
        className
      )}
    >
      {children}
    </button>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-sans text-[11px] font-semibold text-ink">
      {children}
    </kbd>
  );
}

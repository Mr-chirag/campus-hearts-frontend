"use client";

import Link from "next/link";
import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { Check, Clock, Crown, Eye, Heart, Star, Users, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { usePaymentStore } from "@/store/paymentStore";
import { cn } from "@/lib/cn";
import { TRIAL_DAYS } from "@/types";

/**
 * ONE upsell, five triggers.
 *
 * Every gated moment routes through here so the pitch is identical wherever a
 * user meets a wall — same layout, same perks, same price. Five bespoke
 * "go premium" treatments would drift in copy and look cheap next to each
 * other; this one is worth designing properly because it is the single screen
 * standing between a free user and revenue.
 *
 * The perk that triggered it is highlighted rather than shown alone: someone
 * blocked on likes should still see that receipts and viewers come with it.
 */

export type UpsellTrigger =
  | "likes"
  | "superlikes"
  | "viewers"
  | "ghost_read"
  | "receipts";

const PERKS = [
  { id: "likes", icon: Heart, label: "Unlimited likes" },
  { id: "superlikes", icon: Star, label: "5 superlikes a day" },
  { id: "viewers", icon: Users, label: "See who viewed you" },
  { id: "receipts", icon: Check, label: "Read receipts" },
  { id: "ghost_read", icon: Eye, label: "Ghost reading" },
] as const;

const COPY: Record<UpsellTrigger, { title: string; body: string }> = {
  likes: {
    title: "You're out of likes",
    body: "Free accounts get a set number each day. Premium never runs out.",
  },
  superlikes: {
    title: "That's your superlike for today",
    body: "Premium gets five a day — and a superlike puts you at the top of their deck.",
  },
  viewers: {
    title: "Someone's been looking",
    body: "We can tell you how many. Premium tells you who.",
  },
  ghost_read: {
    title: "Read without being seen",
    body: "Ghost reading lets you open a message without the sender ever knowing.",
  },
  receipts: {
    title: "Know when it's been read",
    body: "Premium shows you read receipts on the messages you send.",
  },
};

const resetLabel = (resetsAt?: string) => {
  if (!resetsAt) return null;
  const ms = new Date(resetsAt).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.round((ms % 3_600_000) / 60_000);
  return hours > 0 ? `Resets in ${hours}h ${minutes}m` : `Resets in ${minutes}m`;
};

export function PremiumUpsell({
  open,
  onOpenChange,
  trigger,
  resetsAt,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: UpsellTrigger;
  /** Quota triggers only — shows when the allowance comes back. */
  resetsAt?: string;
}) {
  const isDesktop = useIsDesktop();
  const { plans, fetchPlans } = usePaymentStore();

  // Price comes from the server, never hardcoded.
  useEffect(() => {
    if (open && plans.length === 0) void fetchPlans();
  }, [open, plans.length, fetchPlans]);

  const cheapest = plans.length
    ? plans.reduce((min, p) =>
        p.amount_inr / p.duration_days < min.amount_inr / min.duration_days ? p : min
      )
    : null;
  const perMonth = cheapest
    ? Math.round(cheapest.amount_inr / (cheapest.duration_days / 30))
    : null;

  const copy = COPY[trigger];
  const reset = resetLabel(resetsAt);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount>
              <motion.div
                // Sheet up from the bottom on a phone, scale in on desktop —
                // the same reasoning as <ResponsiveSheet>, but this one needs
                // its own chrome so it can carry the gradient header.
                initial={isDesktop ? { opacity: 0, scale: 0.94 } : { y: "100%" }}
                animate={isDesktop ? { opacity: 1, scale: 1 } : { y: 0 }}
                exit={isDesktop ? { opacity: 0, scale: 0.96 } : { y: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
                className={cn(
                  "fixed z-50 overflow-hidden bg-surface shadow-2xl",
                  isDesktop
                    ? "left-1/2 top-1/2 w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-card"
                    : "inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-card pb-safe"
                )}
              >
                {/* ── gradient crown band ─────────────────────────── */}
                <div className="relative bg-gradient-to-br from-primary via-primary to-secondary px-6 pb-8 pt-9 text-center">
                  <Dialog.Close
                    className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                    aria-label="Close"
                  >
                    <X className="size-5" />
                  </Dialog.Close>

                  <motion.span
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.08, type: "spring", stiffness: 260, damping: 18 }}
                    className="mx-auto flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-8 ring-white/10"
                  >
                    <Crown className="size-8 text-white" aria-hidden />
                  </motion.span>

                  <Dialog.Title className="mt-4 font-display text-2xl font-extrabold text-white">
                    {copy.title}
                  </Dialog.Title>
                  <Dialog.Description className="mx-auto mt-2 max-w-[19rem] text-pretty text-sm leading-relaxed text-white/90">
                    {copy.body}
                  </Dialog.Description>

                  {reset && (
                    <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                      <Clock className="size-3.5" aria-hidden />
                      {reset}
                    </p>
                  )}
                </div>

                {/* ── perks ───────────────────────────────────────── */}
                <div className="px-6 py-6">
                  <ul className="space-y-1.5">
                    {PERKS.map(({ id, icon: Icon, label }) => {
                      const isTrigger = id === trigger;
                      return (
                        <li
                          key={id}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors",
                            isTrigger ? "bg-primary/10" : ""
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-8 shrink-0 items-center justify-center rounded-xl",
                              isTrigger ? "bg-primary text-white" : "bg-accent/40 text-primary-ink"
                            )}
                          >
                            <Icon className="size-4" aria-hidden />
                          </span>
                          <span
                            className={cn(
                              "min-w-0 flex-1 text-[15px]",
                              isTrigger ? "font-bold text-ink" : "font-medium text-subtext"
                            )}
                          >
                            {label}
                          </span>
                          {isTrigger && (
                            <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                              This
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  <Button asChild block className="mt-6">
                    <Link href="/premium">
                      {perMonth ? `Get Premium — from ₹${perMonth}/mo` : "See Premium"}
                    </Link>
                  </Button>

                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="mt-2 w-full py-2.5 text-sm font-semibold text-subtext transition-colors hover:text-ink"
                  >
                    Not now
                  </button>

                  <p className="mt-3 text-center text-xs text-subtext">
                    New accounts get {TRIAL_DAYS} days free. Nothing is charged
                    automatically.
                  </p>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

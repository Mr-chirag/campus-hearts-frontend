"use client";

import { useEffect, useState } from "react";
import { Check, Clock, Crown, Eye, Heart, Star, Users } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuthStore } from "@/store/authStore";
import { usePaymentStore } from "@/store/paymentStore";
import { cn } from "@/lib/cn";
import type { PlanId } from "@/types";
import { TRIAL_DAYS } from "@/types";

/**
 * Premium.
 *
 * On the web Razorpay Checkout is just a script — the whole
 * `react-native-razorpay` native-module problem that makes this untestable in
 * Expo Go simply does not exist here. The script is still loaded on demand
 * (see services/razorpay.ts) so its weight only lands on this page.
 *
 * Prices are NEVER hardcoded: they come from GET /api/payment/plans in paise,
 * and the publishable key comes back on create-order. The secret stays on the
 * server, where the HMAC verification that actually grants premium happens.
 */

const PERKS = [
  {
    icon: Heart,
    title: "Unlimited likes",
    body: "Free accounts get a set number each day. Premium never runs out.",
  },
  {
    icon: Star,
    title: "5 superlikes a day",
    body: "Instead of one. Superlikes put you at the top of someone's deck.",
  },
  {
    icon: Users,
    title: "See who viewed you",
    body: "Free accounts see how many people looked. Premium sees who they were.",
  },
  {
    icon: Check,
    title: "Read receipts",
    body: "Know when your messages have actually been read.",
  },
  {
    icon: Eye,
    title: "Ghost reading",
    body: "Read without sending a receipt back. On by default, and you can switch it off.",
  },
];

export default function PremiumPage() {
  const user = useAuthStore((s) => s.user);
  const { plans, status, isLoadingPlans, purchasingPlanId, fetchPlans, fetchStatus, purchase } =
    usePaymentStore();

  // `null` means "the user hasn't chosen yet" — the effective selection is
  // derived below rather than written back into state from an effect.
  const [chosen, setChosen] = useState<PlanId | null>(null);

  useEffect(() => {
    void fetchPlans();
    void fetchStatus();
  }, [fetchPlans, fetchStatus]);

  // Default to the middle plan once the server says what exists. Derived, so
  // no render is wasted syncing a prop into state.
  const selected: PlanId | null =
    chosen ?? (plans.length ? plans[Math.min(1, plans.length - 1)].id : null);

  const isPremium = user?.is_premium ?? false;
  const onTrial = isPremium && (status?.is_trial ?? false);
  const daysLeft = status?.days_remaining ?? 0;

  return (
    <>
      <AppHeader title="Premium" mobileOnly />

      <main className="mx-auto w-full max-w-2xl px-4 py-4 lg:py-8">
        <div className="text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-gold/25">
            <Crown className="size-8 text-gold-ink" aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold text-ink">
            {onTrial
              ? "You're on your free trial 🎁"
              : isPremium
                ? "You're Premium 👑"
                : "Campus Hearts Premium"}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-pretty leading-relaxed text-subtext">
            {isPremium
              ? status?.premium_until
                ? `Active until ${new Date(status.premium_until).toLocaleDateString()}.`
                : "Your plan is active."
              : `Every new account gets ${TRIAL_DAYS} days free. After that, a few small things that make the app nicer to use.`}
          </p>
        </div>

        {/* A trial that quietly runs out is a nasty surprise. Say what's left,
            and keep the plans visible underneath so continuing is one tap. */}
        {onTrial && (
          <div className="mt-6 flex items-start gap-3 rounded-card border border-gold/40 bg-gold/10 p-4">
            <Clock className="mt-0.5 size-5 shrink-0 text-gold-ink" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">
                {daysLeft > 0
                  ? `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left on your free trial`
                  : "Your free trial ends today"}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-subtext">
                You have everything below right now. Pick a plan any time to keep
                it — nothing is charged automatically, and nothing happens
                without you choosing it.
              </p>
            </div>
          </div>
        )}

        <ul className="mt-8 space-y-3">
          {PERKS.map(({ icon: Icon, title, body }) => (
            <li key={title}>
              <Card className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="size-5 text-primary-ink" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <CardTitle className="text-base">{title}</CardTitle>
                  <p className="mt-1 text-sm leading-relaxed text-subtext">{body}</p>
                </span>
              </Card>
            </li>
          ))}
        </ul>

        {(!isPremium || onTrial) && (
          <div className="mt-8">
            <h2 className="mb-3 font-display text-lg font-bold text-ink">
              {onTrial ? "Keep Premium after your trial" : "Choose a plan"}
            </h2>

            {isLoadingPlans && plans.length === 0 ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-card" />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <Card className="text-center text-sm text-subtext">
                Plans couldn&apos;t be loaded right now. Try again shortly.
              </Card>
            ) : (
              <ul className="space-y-2">
                {plans.map((plan) => {
                  const active = selected === plan.id;
                  const perMonth = plan.amount_inr / (plan.duration_days / 30);

                  return (
                    <li key={plan.id}>
                      <button
                        type="button"
                        onClick={() => setChosen(plan.id)}
                        aria-pressed={active}
                        className={cn(
                          "flex w-full items-center gap-4 rounded-card border-2 bg-surface px-5 py-4 text-left transition-colors",
                          active
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-accent"
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                            active ? "border-primary bg-primary" : "border-accent"
                          )}
                          aria-hidden
                        >
                          {active && <Check className="size-4 text-white" strokeWidth={3} />}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-ink">{plan.label}</span>
                          <span className="block text-xs text-subtext">
                            ≈ ₹{Math.round(perMonth)}/month
                          </span>
                        </span>

                        <span className="shrink-0 font-display text-xl font-extrabold tabular-nums text-ink">
                          ₹{plan.amount_inr}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <Button
              block
              className="mt-6"
              disabled={!selected}
              loading={purchasingPlanId !== null}
              onClick={() => selected && void purchase(selected)}
            >
              Continue to payment
            </Button>

            <p className="mt-3 text-center text-xs leading-relaxed text-subtext">
              Payments are handled by Razorpay. Premium is activated only after
              your payment is verified on our server.
            </p>
          </div>
        )}
      </main>
    </>
  );
}

"use client";

import type { SwipeQuota } from "@/types";

// The "you've hit the limit" dialog lives in components/premium/PremiumUpsell —
// one component serves every gated moment so the pitch can't drift between them.

/** Compact counter above the deck. Hidden entirely for unlimited accounts. */
export function QuotaCounter({ quota }: { quota: SwipeQuota | null }) {
  if (!quota || quota.unlimited_likes) return null;

  const likes = quota.likes_remaining ?? 0;
  const low = likes <= 5;

  return (
    <p
      className={`mb-3 text-center text-xs font-medium ${low ? "text-primary-ink" : "text-subtext"}`}
    >
      {likes} of {quota.likes_per_day} likes left today
      {quota.superlikes_remaining !== null && (
        <> · {quota.superlikes_remaining} superlike{quota.superlikes_remaining === 1 ? "" : "s"}</>
      )}
    </p>
  );
}

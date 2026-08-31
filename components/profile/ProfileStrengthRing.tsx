import { cn } from "@/lib/cn";

/**
 * Profile strength, always the SERVER's number.
 *
 * Scoring lives in backend/utils/calculateProfileStrength.js: 20 per photo up
 * to 3, 20 for a bio of 10+ characters, 5 per interest up to 4. Never recompute
 * it here — if the two ever disagree the client is the one that's wrong.
 */
export function ProfileStrengthRing({
  value,
  size = 76,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={stroke}
          opacity={0.45}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>

      <span className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-display font-extrabold tabular-nums text-primary-ink"
          style={{ fontSize: size * 0.26 }}
        >
          {clamped}
        </span>
      </span>

      <span className="sr-only">Profile strength: {clamped} out of 100</span>
    </div>
  );
}

/** The one place that explains how to raise the number, so it stays truthful. */
export const STRENGTH_TIPS = [
  { test: (p: { photos?: string[] }) => (p.photos?.length ?? 0) < 3, text: "Add up to 3 photos (+20 each)" },
  { test: (p: { bio?: string }) => (p.bio?.trim().length ?? 0) < 10, text: "Write a bio of 10+ characters (+20)" },
  { test: (p: { interests?: string[] }) => (p.interests?.length ?? 0) < 4, text: "Pick up to 4 interests (+5 each)" },
];

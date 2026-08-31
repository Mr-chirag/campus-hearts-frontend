import { Heart } from "lucide-react";

/**
 * THE SIGNATURE ELEMENT.
 *
 * A timetable, because it is the one artifact every engineering student's day
 * is actually built around — and because the product's real premise is the gap
 * between classes, not a heart floating on a gradient. The occupied periods are
 * deliberately muted and unreadable-ish; the free cell is the only thing lit.
 *
 * No JS: the bloom is a CSS animation, so the page stays a Server Component.
 */

const ROWS = [
  { time: "9:00", label: "Engineering Maths III", room: "LT-4" },
  { time: "10:20", label: "DBMS", room: "CS-201" },
  { time: "11:40", label: null, room: null }, // the point of the whole thing
  { time: "1:00", label: "Lunch", room: "Canteen" },
  { time: "2:20", label: "OS Lab", room: "Lab-2" },
];

export function Timetable() {
  return (
    <div className="relative mx-auto w-full max-w-[22rem]">
      {/* ambient bloom behind the card */}
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgba(255,77,109,0.35), transparent 70%)",
        }}
      />

      <div className="overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-[0_24px_60px_-24px_rgba(27,42,74,0.45)]">
        <div className="flex items-baseline justify-between border-b border-border bg-paper px-5 py-3.5">
          <p className="font-display text-sm font-bold tracking-tight text-navy">
            Wednesday
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-subtext">
            Sem 6 · CSE
          </p>
        </div>

        <ul className="divide-y divide-border">
          {ROWS.map((row) =>
            row.label ? (
              <li key={row.time} className="flex items-center gap-4 px-5 py-3.5">
                <span className="w-12 shrink-0 font-mono text-xs text-subtext">
                  {row.time}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-subtext/90">
                    {row.label}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[11px] text-subtext/70">
                  {row.room}
                </span>
              </li>
            ) : (
              <li key={row.time} className="relative px-3 py-3">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary p-4 text-white shadow-[0_10px_30px_-10px_rgba(255,77,109,0.7)]">
                  <div className="flex items-center gap-4">
                    <span className="w-12 shrink-0 font-mono text-xs text-white/80">
                      {row.time}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-base font-extrabold tracking-tight">
                        Free period
                      </span>
                      <span className="block text-xs text-white/85">
                        So is hers. Third row, DBMS.
                      </span>
                    </span>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                      <Heart className="size-4" fill="white" aria-hidden />
                    </span>
                  </div>

                  {/* slow sheen — the only motion on the page */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full animate-[sheen_4.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  />
                </div>
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
}

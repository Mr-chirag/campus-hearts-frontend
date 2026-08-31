/**
 * Confessions, as the thing they actually are on a campus: paper slips on a
 * notice board.
 *
 * This is the one place the handwriting face earns its keep — Kalam, from an
 * Indian type foundry, so the letterforms belong to the same world as the
 * reader. Used nowhere else on the page, which is what keeps it a texture
 * rather than a gimmick.
 */

const SLIPS = [
  {
    text: "you sit two rows ahead in DBMS and i have learnt nothing all semester",
    tilt: "-2.5deg",
  },
  { text: "whoever returned my calculator in lab 2 — marry me", tilt: "1.8deg" },
  {
    text: "the girl who always takes the last samosa at 4pm. i respect it. hi.",
    tilt: "-1.2deg",
  },
];

export function ConfessionSlips() {
  return (
    <ul className="grid gap-5 sm:grid-cols-3">
      {SLIPS.map((slip) => (
        <li
          key={slip.text}
          style={{ rotate: slip.tilt }}
          className="relative rounded-sm bg-paper p-6 pt-8 shadow-[0_10px_28px_-14px_rgba(27,42,74,0.5)] transition-transform duration-300 hover:rotate-0"
        >
          {/* tape */}
          <span
            aria-hidden
            className="absolute -top-2.5 left-1/2 h-6 w-16 -translate-x-1/2 -rotate-2 rounded-[2px] bg-highlight/70 shadow-sm"
          />
          <p className="font-hand text-[19px] leading-[1.5] text-navy">
            {slip.text}
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-subtext">
            — anonymous
          </p>
        </li>
      ))}
    </ul>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Bricolage_Grotesque, Kalam } from "next/font/google";
import {
  ArrowRight,
  Eye,
  GraduationCap,
  Heart,
  MessagesSquare,
  ShieldCheck,
  Shuffle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Timetable } from "@/components/landing/Timetable";
import { ConfessionSlips } from "@/components/landing/ConfessionSlips";
import { PRIMARY_EMAIL_DOMAIN } from "@/services/config";
import { TRIAL_DAYS } from "@/types";

/**
 * The public landing page — the entire SEO surface, and the only page an
 * anonymous visitor sees.
 *
 * A Server Component with no client JS beyond the shared <Button>. Everything
 * atmospheric here is CSS: the ruled paper, the graph grid, the blooms, the
 * single sheen on the timetable. That keeps the page fast and crawlable, which
 * matters more on this page than on any other.
 *
 * DESIGN NOTE — the display face is overridden locally to Bricolage Grotesque
 * and Kalam is added for the confession slips. Neither is loaded for the app
 * itself, which keeps using Poppins.
 *
 * HONESTY NOTE — there are deliberately no user counts, no testimonials and no
 * star ratings on this page. The product hasn't launched; inventing social
 * proof for a student dating app is exactly the sort of thing that would
 * deserve to be found out.
 */

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const hand = Kalam({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-kalam",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Campus Hearts — dating, for your campus only",
  description:
    "A dating app just for verified students. Match with people who actually go to your college, send anonymous confessions, and meet someone between lectures.",
  openGraph: {
    title: "Campus Hearts — dating, for your campus only",
    description:
      "Verified students only. Match, chat, and send anonymous confessions to people who actually go to your college.",
    type: "website",
    siteName: "Campus Hearts",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Hearts — dating, for your campus only",
    description: "Verified students only. Match with people who actually go to your college.",
  },
  alternates: { canonical: "/" },
};

const FEATURES = [
  {
    icon: Heart,
    title: "Swipe your campus",
    body: "A deck of students from your college, and nowhere else. Like, pass, or spend a superlike on someone worth it.",
  },
  {
    icon: MessagesSquare,
    title: "Chat the moment you match",
    body: "Realtime messages, typing dots, read receipts. No 24-hour timers, no waiting for a queue.",
  },
  {
    icon: Sparkles,
    title: "Anonymous confessions",
    body: "Say the thing you've been sitting on. They see the message, not your name — until you decide otherwise.",
  },
  {
    icon: Shuffle,
    title: "Random chat",
    body: "Paired with a stranger from campus, both of you unnamed. Reveal only if you both want to.",
  },
];

const FAQ = [
  {
    q: "Can my college see any of this?",
    a: "No. Campus Hearts is an independent student project with no connection to any college or university. Nothing here is reported to, shared with, or visible to your institution, and none of it touches your attendance, grades or placements.",
  },
  {
    q: "Who is actually allowed in?",
    a: PRIMARY_EMAIL_DOMAIN
      ? `Anyone 18 or over with a working @${PRIMARY_EMAIL_DOMAIN} email address. We send a six-digit code and you type it back — that's the whole check, and it's why there are no bots here.`
      : "Anyone 18 or over with a working college email address. We send a six-digit code and you type it back — that's the whole check.",
  },
  {
    q: "Is a confession really anonymous?",
    a: "The other person sees your message and not your name, and your identity is stripped on our server rather than hidden in the app. You choose if and when to reveal yourself — and that choice is permanent.",
  },
  {
    q: "Will my email be shown to anyone?",
    a: "Never. It's used to verify you're a student and to sign you in. Other people see your name, photos and whatever else you choose to put on your profile.",
  },
];

export default function LandingPage() {
  return (
    <div className={`${display.variable} ${hand.variable} min-h-dvh-safe overflow-hidden`}>
      {/* ─────────────────────────────────────────────── nav */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <span className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-navy">
          <span aria-hidden>💗</span> Campus Hearts
        </span>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/signup">Join</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* ─────────────────────────────────────────── hero */}
        <section className="relative bg-ruled">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 -top-40 size-[32rem] rounded-full opacity-60 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(255,143,171,0.5), transparent 68%)",
            }}
          />

          <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-5 pb-24 pt-10 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pt-24">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-navy">
                <GraduationCap className="size-3.5" aria-hidden />
                Verified students only
              </span>

              <h1 className="mt-7 text-balance font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-navy sm:text-6xl lg:text-[4.2rem]">
                Your 11:40 free period is{" "}
                <span className="highlighted">somebody else&apos;s</span> too.
              </h1>

              <p className="mx-auto mt-6 max-w-lg text-pretty text-lg leading-relaxed text-subtext lg:mx-0">
                Campus Hearts is a dating app with one rule about who gets in:
                a working college email. No bots, no strangers three cities
                away, nobody pretending to be a student.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Button asChild className="sm:w-auto">
                  <Link href="/signup">
                    Create your account
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="sm:w-auto">
                  <Link href="/login">I already have one</Link>
                </Button>
              </div>

              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-2 text-sm font-semibold text-gold-ink">
                <span aria-hidden>🎁</span>
                {TRIAL_DAYS} days of Premium free when you join
              </p>
            </div>

            <Timetable />
          </div>
        </section>

        {/* ─────────────────────────────────── the door (navy) */}
        <section className="relative overflow-hidden bg-navy bg-grid text-white">
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                The door
              </span>
              <h2 className="mt-4 text-balance font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                One check. Then you&apos;re in.
              </h2>
              <p className="mt-4 max-w-md text-pretty leading-relaxed text-white/70">
                We email a six-digit code to your college address and you type it
                back. That&apos;s the entire verification — which is also why an
                account can&apos;t exist without one.
              </p>

              <ul className="mt-8 space-y-3">
                {[
                  "Your email is never shown to another student",
                  "No ID upload, no documents, no forms",
                  "Not affiliated with any college — see our terms",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3 text-[15px] text-white/85">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            {/* student-ID mock: the physical analogue of the email check */}
            <div className="mx-auto w-full max-w-sm">
              <div className="rotate-[-2deg] rounded-2xl bg-white p-5 shadow-[0_28px_60px_-20px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="font-display text-sm font-extrabold tracking-tight text-navy">
                    STUDENT
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtext">
                    verified
                  </span>
                </div>

                <div className="flex items-center gap-4 py-4">
                  <div className="size-16 shrink-0 rounded-xl bg-gradient-to-br from-secondary to-accent" aria-hidden />
                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold text-navy">
                      Sem 6 · CSE
                    </p>
                    <p className="truncate font-mono text-xs text-subtext">
                      yourname@{PRIMARY_EMAIL_DOMAIN ?? "college.edu"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  {["4", "9", "2", "8", "1", "7"].map((digit, i) => (
                    <span
                      key={i}
                      className="flex h-11 flex-1 items-center justify-center rounded-lg border border-primary/20 bg-surface-muted font-display text-lg font-bold text-navy"
                    >
                      {digit}
                    </span>
                  ))}
                </div>
                <p className="mt-2.5 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-subtext">
                  code sent to your inbox
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────── features */}
        <section className="mx-auto w-full max-w-6xl px-5 py-20 lg:py-28">
          <h2 className="max-w-xl text-balance font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            Four things you can&apos;t do on any other app.
          </h2>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="group rounded-card border border-border bg-surface p-7 transition-colors hover:border-primary"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="size-5 text-primary-ink transition-colors group-hover:text-white" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-navy">
                  {title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-subtext">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ────────────────────────────────────── confessions */}
        <section className="relative bg-paper py-20 lg:py-28">
          <div className="mx-auto w-full max-w-5xl px-5">
            <div className="max-w-xl">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-subtext">
                Confessions
              </span>
              <h2 className="mt-4 text-balance font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
                Say it without your name on it.
              </h2>
              <p className="mt-4 text-pretty leading-relaxed text-subtext">
                Write to anyone on campus. They read the message, not the sender.
                If they accept, you can talk — and you stay anonymous until you
                decide you&apos;d rather not be.
              </p>
            </div>

            <div className="mt-12">
              <ConfessionSlips />
            </div>

            <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-subtext">
              Examples of the format — not real confessions
            </p>
          </div>
        </section>

        {/* ───────────────────────────────────────────── faq */}
        <section className="mx-auto w-full max-w-3xl px-5 py-20 lg:py-28">
          <h2 className="text-balance font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            The questions everyone asks first.
          </h2>

          <dl className="mt-10 divide-y divide-border border-y border-border">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="py-7">
                <dt className="font-display text-lg font-bold tracking-tight text-navy">
                  {q}
                </dt>
                <dd className="mt-2.5 text-pretty leading-relaxed text-subtext">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ───────────────────────────────────────────── cta */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grid opacity-40"
          />
          <div className="relative mx-auto w-full max-w-3xl px-5 py-24 text-center text-white">
            <Eye className="mx-auto size-8 text-white/70" aria-hidden />
            <h2 className="mt-6 text-balance font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Somebody on your campus is worth meeting.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-pretty text-white/85">
              It takes about a minute, and your first {TRIAL_DAYS} days of
              Premium are on us.
            </p>
            <div className="mt-10 flex justify-center">
              <Button asChild variant="subtle" className="w-full max-w-xs">
                <Link href="/signup">Create your account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-navy px-5 py-12 text-center text-sm text-white/60">
        <Link href="/terms" className="font-medium text-white/80 hover:underline">
          Terms of Use
        </Link>
        <p className="mx-auto mt-4 max-w-md text-pretty text-xs leading-relaxed">
          Campus Hearts is an independent student project. It is not affiliated
          with, endorsed by, or operated by any college or university.
        </p>
        <p className="mt-4 font-mono text-[11px]">
          © {new Date().getFullYear()} Campus Hearts
        </p>
      </footer>
    </div>
  );
}

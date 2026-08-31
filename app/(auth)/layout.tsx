import Link from "next/link";
import { SessionProvider } from "@/components/layout/SessionProvider";

/**
 * The logged-out shell. `proxy.ts` already bounces anyone holding an auth
 * cookie to /discover, so these pages never render for a signed-in visitor.
 *
 * Centred column on every viewport — an auth form has no more to say at 1440px
 * than it does at 390px, so this is one of the screens that gets a max-width
 * rather than a desktop-specific layout.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    // bootstrap={false}: proxy.ts already redirects anyone holding a token
    // away from these pages, so there is no session worth restoring.
    <SessionProvider bootstrap={false}>
    <div className="flex min-h-dvh-safe flex-col">
      <header className="mx-auto w-full max-w-md px-5 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display text-lg font-bold text-primary-ink"
        >
          <span aria-hidden>💗</span> Campus Hearts
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-12">
        {children}
      </main>
    </div>
    </SessionProvider>
  );
}

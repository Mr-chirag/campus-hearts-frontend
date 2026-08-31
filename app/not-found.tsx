import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh-safe flex-col items-center justify-center px-6 text-center">
      <span className="text-5xl" aria-hidden>
        🧭
      </span>
      <h1 className="mt-5 font-display text-2xl font-bold text-ink">
        Nothing here
      </h1>
      <p className="mt-2 max-w-sm text-pretty leading-relaxed text-subtext">
        This page doesn&apos;t exist — or whatever was here has been taken down.
      </p>
      <Button asChild className="mt-8 w-full max-w-xs">
        <Link href="/discover">Back to Discover</Link>
      </Button>
    </main>
  );
}

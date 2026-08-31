"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useAuthStore } from "@/store/authStore";

/**
 * The real authentication check, replacing the app's `app/index.tsx` gate.
 *
 * `middleware.ts` already redirected anyone without a token cookie — but a
 * cookie only proves a string exists, not that it is a valid, unexpired JWT for
 * a live account. This waits for `loadUser()` to settle and redirects if the
 * server disagreed.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isLoading || isAuthenticated) return;
    // Preserve where they were headed so login can return them to it.
    const next = encodeURIComponent(pathname);
    router.replace(`/login?next=${next}`);
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-dvh-safe items-center justify-center">
        <Spinner label="Loading your campus…" />
      </div>
    );
  }

  return <>{children}</>;
}

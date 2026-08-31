"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, isNavItemActive } from "./nav-items";

/**
 * Desktop navigation. Renders only at `lg` and above; <BottomTabBar> covers
 * everything below. Same destinations, same order, same active logic — the
 * only difference is that a wide viewport can afford labels, an account block
 * and a logout button.
 */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh-safe lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-surface/60 lg:px-4 lg:py-6">
      <Link href="/discover" className="mb-8 flex items-center gap-2 px-2">
        <span className="text-2xl" aria-hidden>
          💗
        </span>
        <span className="font-display text-xl font-bold text-primary-ink">Campus Hearts</span>
      </Link>

      <nav aria-label="Primary" className="flex-1">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(item, pathname);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-semibold transition-colors",
                    active
                      ? "bg-primary/10 text-primary-ink"
                      : "text-subtext hover:bg-surface-muted hover:text-ink"
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.5 : 2} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-4 border-t border-border pt-4">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-surface-muted"
        >
          <Avatar src={user?.photos?.[0]} name={user?.full_name} size={40} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-ink">
              {user?.full_name ?? "—"}
            </span>
            <span className="block truncate text-xs text-subtext">
              {user?.branch ?? ""}
            </span>
          </span>
        </Link>

        <div className="mt-2 flex gap-1">
          <Link
            href="/settings"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-subtext transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <Settings className="size-4" aria-hidden />
            Settings
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-subtext transition-colors hover:bg-surface-muted hover:text-danger"
          >
            <LogOut className="size-4" aria-hidden />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}

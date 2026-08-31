"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, isImmersiveRoute, isNavItemActive } from "./nav-items";

/**
 * Mobile navigation. Hidden at `lg` and above, where <Sidebar> takes over.
 *
 * `pb-safe` clears the iPhone home indicator — without it the bottom row of
 * icons sits underneath the system gesture bar and is genuinely hard to tap.
 */
export function BottomTabBar() {
  const pathname = usePathname();

  // A full-screen conversation owns the bottom edge — see isImmersiveRoute.
  if (isImmersiveRoute(pathname)) return null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-safe backdrop-blur-lg lg:hidden"
    >
      <ul className="flex items-stretch justify-around">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(item, pathname);
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                // min-h-14 keeps every tap target well past the 44px floor.
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors",
                  active ? "text-primary-ink" : "text-subtext hover:text-ink"
                )}
              >
                <Icon
                  className={cn("size-6 transition-transform", active && "scale-110")}
                  strokeWidth={active ? 2.5 : 2}
                  aria-hidden
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

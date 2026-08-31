"use client";

import { usePathname } from "next/navigation";
import { BottomTabBar } from "./BottomTabBar";
import { Sidebar } from "./Sidebar";
import { isImmersiveRoute } from "./nav-items";
import { cn } from "@/lib/cn";

/**
 * The signed-in shell.
 *
 * One tree, two navigations: <Sidebar> is `hidden lg:flex`, <BottomTabBar> is
 * `lg:hidden`. Both render from the same NAV_ITEMS array, so a destination
 * cannot exist on one viewport and go missing on the other.
 *
 * HEIGHT CONTRACT — the reason this is a component and not markup in layout.tsx:
 *
 *   normal routes    `min-h-dvh` + `pb-20`, so the page can grow and scroll
 *                    with the document, clear of the fixed tab bar.
 *
 *   immersive routes `h-dvh` + `overflow-hidden` and NO bottom padding, so a
 *                    child that asks for full height gets exactly the viewport
 *                    and can pin its own footer (the chat composer) to the
 *                    bottom edge. Reserving tab-bar space here as well would
 *                    make the page taller than the screen and push the
 *                    composer below the fold.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = isImmersiveRoute(pathname);

  return (
    <div
      className={cn(
        "flex",
        immersive ? "h-dvh-safe overflow-hidden" : "min-h-dvh-safe"
      )}
    >
      {/* Keyboard users land on the sidebar's ~8 links on every navigation
          otherwise. Visually hidden until focused. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <Sidebar />

      <div
        id="main-content"
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          immersive ? "min-h-0" : "pb-20 lg:pb-0"
        )}
      >
        {children}
      </div>

      <BottomTabBar />
    </div>
  );
}

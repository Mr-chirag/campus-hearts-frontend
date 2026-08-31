import { Flame, Heart, MessageCircle, Sparkles, User, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Also highlight this item for nested routes under these prefixes. */
  matches?: string[];
}

/**
 * THE source of navigation truth. <BottomTabBar> and <Sidebar> both render from
 * this array — the two components differ in presentation only, so a destination
 * can never exist on one viewport and not the other.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/discover", label: "Discover", icon: Flame },
  { href: "/matches", label: "Matches", icon: MessageCircle, matches: ["/chat"] },
  { href: "/campus", label: "Campus", icon: Sparkles },
  { href: "/premium", label: "Premium", icon: Heart },
  { href: "/profile", label: "Profile", icon: User, matches: ["/settings", "/analytics"] },
];

export const isNavItemActive = (item: NavItem, pathname: string): boolean => {
  if (pathname === item.href) return true;
  if (pathname.startsWith(`${item.href}/`)) return true;
  return (item.matches ?? []).some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
};

/**
 * Routes that take over the whole viewport on mobile: no bottom tab bar, no
 * padding reserved for one.
 *
 * A conversation needs its composer pinned to the bottom edge of the screen.
 * If the tab bar is also there, the page is 100dvh PLUS the bar's height, and
 * the composer falls below the fold — you have to scroll to type, which is the
 * bug this list exists to prevent. Every chat app resolves this the same way:
 * the detail screen replaces the tab bar, and the header's back button is how
 * you get out.
 *
 * Desktop is unaffected — the sidebar is beside the content, not below it.
 */
const IMMERSIVE_PREFIXES = ["/chat"];

export const isImmersiveRoute = (pathname: string): boolean =>
  IMMERSIVE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

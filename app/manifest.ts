import type { MetadataRoute } from "next";

/**
 * PWA manifest — makes the site installable to a phone home screen and launch
 * standalone (no browser chrome), which is what closes most of the remaining
 * gap against the native app.
 *
 * Deliberately NO offline caching of user data. A dating feed, a match list and
 * a conversation are all worthless stale, and a service worker serving
 * yesterday's messages would be worse than an honest "you're offline".
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Campus Hearts",
    short_name: "Campus Hearts",
    description:
      "Campus Hearts is a campus people connecting platform. Verified students only.",
    start_url: "/discover",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFF0F3",
    theme_color: "#FF4D6D",
    categories: ["social", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Maskable variants carry ~20% safe-area padding, or Android launchers
      // crop the artwork when they apply their own mask.
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Discover", url: "/discover" },
      { name: "Matches", url: "/matches" },
      { name: "Campus", url: "/campus" },
    ],
  };
}

import type { MetadataRoute } from "next";

/**
 * The landing page is the entire public footprint. Every signed-in route holds
 * other students' names, photos and messages and must never be crawled.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/signup", "/terms"],
      disallow: [
        "/discover",
        "/matches",
        "/chat/",
        "/campus",
        "/profile",
        "/premium",
        "/analytics",
        "/settings",
      ],
    },
  };
}

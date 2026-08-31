import type { MetadataRoute } from "next";

/** Only the three public pages. Everything else is behind auth. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://campushearts.app";

  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/signup`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/login`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];
}

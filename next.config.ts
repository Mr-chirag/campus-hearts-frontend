import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Every user photo is a Cloudinary URL from the `campus_hearts` folder.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      // Dev seed data only (backend/seedDevUsers.js). Real user photos are
      // always Cloudinary — this can be dropped once seeding isn't needed.
      { protocol: "https", hostname: "randomuser.me", pathname: "/api/portraits/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import "./globals.css";

/**
 * The app uses Poppins for headings and buttons. Self-hosted here by next/font
 * — no render-blocking request to Google, and no layout shift from a late swap.
 */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Campus Hearts — connect with people on your campus",
    template: "%s · Campus Hearts",
  },
  description:
    "Campus Hearts is a campus people connecting platform. Verified students only — meet people who actually go to your college, chat, and send anonymous confessions.",
  applicationName: "Campus Hearts",
  robots: { index: true, follow: true },

  // Installable-to-home-screen metadata. `manifest` points at app/manifest.ts.
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "Campus Hearts",
    // The status bar sits over the page, which is what viewportFit:'cover'
    // plus the safe-area padding utilities are already set up for.
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#FF4D6D",
  width: "device-width",
  initialScale: 1,
  // Never disable zoom — pinch-to-zoom is an accessibility requirement, and
  // maximumScale=1 is the single most common a11y failure on mobile sites.
  maximumScale: 5,
  viewportFit: "cover", // required for env(safe-area-inset-*) to resolve
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

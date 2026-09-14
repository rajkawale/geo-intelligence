import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Indegene DS 4.Ai — DM Sans, self-hosted. No Google Fonts CDN, no fallback stack.
const dmSans = localFont({
  src: [
    { path: "./fonts/DMSans-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/DMSans-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/DMSans-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/DMSans-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GEO Intelligence (I)",
  description:
    "Tracks what users ask on LLMs, learns from it, and closes the loop to improve GEO.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

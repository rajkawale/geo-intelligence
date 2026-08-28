import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}
